const WasteLog = require('../models/WasteLog');

const BASE_WASTE = {
  'Chole Bhature': 72, 'Dal Makhani': 68, 'Kadhi Chawal': 58,
  'Rajma Rice': 45, 'Veg Biryani': 51, 'Paneer Butter Masala': 38,
  'Aloo Paratha': 29, 'Pav Bhaji': 44, 'Idli Sambar': 22, 'Poha': 18,
};

const DAY_MULT = { Mon: 0.85, Tue: 0.78, Wed: 1.20, Thu: 0.70, Fri: 1.10, Sat: 1.35, Sun: 1.15 };
const MEAL_MULT = { Breakfast: 0.80, Lunch: 1.10, Snacks: 0.55, Dinner: 1.00 };
const WEATHER_MULT = { Sunny: 1.0, Cloudy: 1.05, Rainy: 1.25, Stormy: 1.40, 'Very Hot': 0.85 };
const EVENT_MULT = {
  None: 1.0, 'Exam Week': 1.45, Holiday: 0.65, 'Sports Day': 0.90,
  'Cultural Fest': 0.75, 'Long Weekend': 0.60,
};

const getRiskLevel = (kg) => {
  if (kg > 60) return 'CRITICAL';
  if (kg > 40) return 'HIGH';
  if (kg > 25) return 'MODERATE';
  return 'LOW';
};

const getRiskColor = (risk) => {
  const map = { CRITICAL: '#ff3d5a', HIGH: '#ff6b2b', MODERATE: '#fbbf24', LOW: '#00e676' };
  return map[risk] || '#00e676';
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const avg = (arr) => (arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0);
const getStdDev = (arr, mean) => {
  if (arr.length <= 1) return 0;
  const variance = arr.reduce((s, n) => s + ((n - mean) ** 2), 0) / arr.length;
  return Math.sqrt(variance);
};
const shortDay = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
const isSameText = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
const weightedRecentAverage = (logs) => {
  if (!logs.length) return 0;
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
  let weighted = 0;
  let totalWeight = 0;
  sorted.forEach((log, idx) => {
    const w = Math.pow(0.9, idx); // Recency weighting.
    weighted += (Number(log.wastedKg) || 0) * w;
    totalWeight += w;
  });
  return totalWeight ? weighted / totalWeight : 0;
};

const predict = async ({ messId, menu, meal, day, weather, event }) => {
  const fallbackBase = BASE_WASTE[menu] || 40;
  const fallbackDayMult = DAY_MULT[day] || 1.0;
  const fallbackMealMult = MEAL_MULT[meal] || 1.0;
  const weatherMult = WEATHER_MULT[weather] || 1.0;
  const eventMult = EVENT_MULT[event] || 1.0;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 180);

  const logs = await WasteLog.find({
    messId,
    date: { $gte: cutoff },
  }).select('menuItemName meal wastedKg date');

  const allWaste = logs.map(l => Number(l.wastedKg) || 0).filter(n => n >= 0);
  const globalAvg = avg(allWaste) || fallbackBase;

  const menuLogs = logs.filter(l => isSameText(l.menuItemName, menu));
  const menuMealLogs = menuLogs.filter(l => isSameText(l.meal, meal));
  const mealLogs = logs.filter(l => isSameText(l.meal, meal));
  const dayLogs = logs.filter(l => shortDay(l.date) === day);

  const exactBase = weightedRecentAverage(menuMealLogs);
  const menuBase = weightedRecentAverage(menuLogs);
  const base =
    menuMealLogs.length >= 2 ? exactBase
      : menuLogs.length >= 4 ? menuBase
        : fallbackBase;

  const histMealMult = mealLogs.length >= 4 && globalAvg > 0
    ? clamp(avg(mealLogs.map(l => Number(l.wastedKg) || 0)) / globalAvg, 0.5, 1.8)
    : fallbackMealMult;
  const histDayMult = dayLogs.length >= 4 && globalAvg > 0
    ? clamp(avg(dayLogs.map(l => Number(l.wastedKg) || 0)) / globalAvg, 0.5, 1.8)
    : fallbackDayMult;

  const mealBlend = clamp(mealLogs.length / 20, 0, 0.75);
  const dayBlend = clamp(dayLogs.length / 20, 0, 0.75);

  const mealMult = Number(((fallbackMealMult * (1 - mealBlend)) + (histMealMult * mealBlend)).toFixed(3));
  const dayMult = Number(((fallbackDayMult * (1 - dayBlend)) + (histDayMult * dayBlend)).toFixed(3));

  const predictedKg = parseFloat((base * dayMult * mealMult * weatherMult * eventMult).toFixed(1));
  const costLoss = parseFloat((predictedKg * 40).toFixed(0));
  const co2Kg = parseFloat((predictedKg * 2.5).toFixed(1));
  const riskLevel = getRiskLevel(predictedKg);

  const baseSample = menuMealLogs.length + menuLogs.length;
  const variationArr = menuMealLogs.length ? menuMealLogs.map(l => Number(l.wastedKg) || 0) : allWaste;
  const mean = avg(variationArr) || 1;
  const volatility = getStdDev(variationArr, mean) / mean;
  const confidence = Math.round(clamp(62 + (Math.min(baseSample, 30) * 1.1) - (volatility * 10), 55, 95));

  const reasons = [];
  if (dayMult > 1) reasons.push(`${day} historically sees ${Math.round((dayMult - 1) * 100)}% higher waste`);
  if (dayMult < 1) reasons.push(`${day} sees ${Math.round((1 - dayMult) * 100)}% lower attendance`);
  if (weatherMult > 1) reasons.push(`${weather} weather increases waste by ${Math.round((weatherMult - 1) * 100)}%`);
  if (eventMult > 1) reasons.push(`${event} inflates waste by ${Math.round((eventMult - 1) * 100)}%`);
  if (eventMult < 1) reasons.push(`${event} reduces attendance by ${Math.round((1 - eventMult) * 100)}%`);
  if (mealMult > 1) reasons.push(`${meal} service has highest consumption rate`);
  reasons.push(`Base waste for ${menu} is ${base.toFixed(1)}kg from your historical logs`);
  reasons.push(`Oracle used ${menuMealLogs.length} exact and ${menuLogs.length} menu-level records`);

  const actions = [];
  if (riskLevel === 'CRITICAL') {
    actions.push('⚠️ Reduce preparation by 30% from standard quantity');
    actions.push('🔔 Alert kitchen staff to monitor portions actively');
    actions.push('📦 Arrange donation pickup for excess food');
  } else if (riskLevel === 'HIGH') {
    actions.push('📉 Reduce preparation by 15-20%');
    actions.push('👀 Monitor serving portions at the counter');
  } else if (riskLevel === 'MODERATE') {
    actions.push('📋 Log servings carefully during meal');
    actions.push('🔄 Prepare backup batch only if needed');
  } else {
    actions.push('✅ Proceed with standard preparation');
    actions.push('📈 Good efficiency day — note for future planning');
  }

  return {
    predictedKg, costLoss, co2Kg, riskLevel,
    riskColor: getRiskColor(riskLevel),
    confidence, reasons, actions,
    factors: {
      base: Number(base.toFixed(2)),
      dayMult,
      mealMult,
      weatherMult,
      eventMult,
      recordsUsed: {
        exactMenuMeal: menuMealLogs.length,
        sameMenuAnyMeal: menuLogs.length,
        sameMealAnyMenu: mealLogs.length,
        sameDayAnyMenu: dayLogs.length,
      },
    },
  };
};

module.exports = { predict };
