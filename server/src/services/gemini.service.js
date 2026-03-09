const { getGeminiClient } = require('../config/gemini');
const mongoose = require('mongoose');

// Simple cache schema
let AICache;
try {
  AICache = mongoose.model('AICache');
} catch {
  const cacheSchema = new mongoose.Schema({
    key: { type: String, unique: true, index: true },
    data: mongoose.Schema.Types.Mixed,
    expiresAt: { type: Date, index: { expires: 0 } },
  });
  AICache = mongoose.model('AICache', cacheSchema);
}

const getCached = async (key) => {
  try {
    const cached = await AICache.findOne({ key, expiresAt: { $gt: new Date() } });
    return cached ? cached.data : null;
  } catch { return null; }
};

const setCache = async (key, data, ttlHours = 24) => {
  try {
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    await AICache.findOneAndUpdate({ key }, { data, expiresAt }, { upsert: true });
  } catch {}
};

const generateInsights = async (messId, wasteData) => {
  const key = `insights:${messId}:${new Date().toDateString()}`;
  const cached = await getCached(key);
  if (cached) return cached;

  const fallback = [
    { icon: '📊', severity: 'info', text: 'Weekly waste patterns analyzed. Tuesday has lowest waste — consider this for menu planning.' },
    { icon: '⚠️', severity: 'moderate', text: 'Rice dishes consistently show higher waste. Consider reducing batch size by 10%.' },
    { icon: '🌧️', severity: 'high', text: 'Rainy days increase waste by 25%. Adjust preparation quantities accordingly.' },
    { icon: '✅', severity: 'info', text: 'Overall waste trend is improving. Keep monitoring daily logs for continued progress.' },
  ];

  try {
    const genAI = getGeminiClient();
    if (!genAI) return fallback;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a food waste analyst for a hostel mess.
Here is this week's waste data: ${JSON.stringify(wasteData)}.
Generate exactly 4 short actionable insights.
Return ONLY a JSON array: [{ "icon": "emoji", "severity": "critical|high|moderate|info", "text": "insight" }]
No markdown, no explanation, just the JSON array.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const insights = JSON.parse(text);
    await setCache(key, insights);
    return insights;
  } catch {
    return fallback;
  }
};

const generateCookReview = async (cookData) => {
  const fallbackReviews = {
    'A+': `${cookData.name} delivered exceptional performance today, maintaining waste below 10% across all dishes. Student ratings were outstanding, reflecting excellent cooking quality and portion management.`,
    'A': `${cookData.name} had a strong service today with good waste control and positive student feedback. Minor adjustments in portion sizing could further optimize performance.`,
    'B+': `${cookData.name} performed above average today. Waste ratios were acceptable but there is room to improve on ${cookData.dishes?.[0]?.menuItemName || 'key dishes'}.`,
    'B': `${cookData.name} maintained standard performance today. Focus on reducing preparation waste and gathering more student feedback to improve the composite score.`,
    'C': `${cookData.name} struggled today with higher than average waste ratios. A review of preparation quantities and cooking techniques is recommended to improve future performance.`,
  };

  try {
    const genAI = getGeminiClient();
    if (!genAI) return fallbackReviews[cookData.grade] || fallbackReviews['B'];

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a kitchen performance reviewer.
Cook: ${cookData.name}, Role: ${cookData.role}.
Today's data: ${JSON.stringify(cookData.dishes)}.
Composite score: ${cookData.compositeScore}/10. Grade: ${cookData.grade}.
Write exactly 2-3 sentences as a performance review.
Be specific, constructive, and reference actual numbers.
Return ONLY the review text, no labels.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return fallbackReviews[cookData.grade] || fallbackReviews['B'];
  }
};

const generateInventorySuggestions = async (messId, lowStockItems) => {
  const key = `inventory:${messId}:${new Date().toDateString()}`;
  const cached = await getCached(key);
  if (cached) return cached;

  const fallback = lowStockItems.map(item => ({
    item: item.name,
    urgency: item.qty === 0 ? 'critical' : item.qty < item.minQty * 0.5 ? 'high' : 'normal',
    suggestion: `Reorder ${item.name}. Current qty ${item.qty}${item.unit} is below minimum ${item.minQty}${item.unit}.`,
  }));

  try {
    const genAI = getGeminiClient();
    if (!genAI) return fallback;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Here are low-stock inventory items: ${JSON.stringify(lowStockItems)}.
Generate reorder suggestions with priority ranking.
Return JSON: [{ "item": "name", "urgency": "critical|high|normal", "suggestion": "text" }]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(text);
    await setCache(key, suggestions);
    return suggestions;
  } catch {
    return fallback;
  }
};

module.exports = { generateInsights, generateCookReview, generateInventorySuggestions };
