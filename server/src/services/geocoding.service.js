const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DEFAULT_TIMEOUT_MS = 8000;

function normalizeQuery(query) {
  return String(query || '').trim();
}

async function geocodeLocation(query) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const url = `${NOMINATIM_URL}?format=jsonv2&limit=1&q=${encodeURIComponent(normalizedQuery)}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en',
        'User-Agent': 'MessMaster/1.0 (location geocoding)',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed with status ${response.status}`);
    }

    const results = await response.json();
    if (!Array.isArray(results) || !results.length) return null;

    const match = results[0];
    const latitude = Number(match.lat);
    const longitude = Number(match.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

    return {
      latitude,
      longitude,
      displayName: String(match.display_name || normalizedQuery).trim(),
      rawQuery: normalizedQuery,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Geocoding request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  geocodeLocation,
};
