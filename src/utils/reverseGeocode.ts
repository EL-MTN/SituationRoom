/**
 * Reverse geocoding utility using OpenStreetMap's Nominatim API
 * Converts coordinates to location names for search queries
 */

export interface GeoResult {
  country: string;
  city?: string;
  display: string;
}

// In-memory cache for geocoding results
const geocodeCache = new Map<string, GeoResult>();

// LocalStorage key for persistence
const GEOCODE_CACHE_KEY = 'situationroom-geocode-cache';

// Load cache from localStorage on initialization
function loadCache(): void {
  try {
    const stored = localStorage.getItem(GEOCODE_CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, GeoResult>;
      Object.entries(parsed).forEach(([key, value]) => {
        geocodeCache.set(key, value);
      });
    }
  } catch {
    // Ignore cache load errors
  }
}

// Save cache to localStorage
function saveCache(): void {
  try {
    const obj: Record<string, GeoResult> = {};
    geocodeCache.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore cache save errors
  }
}

// Initialize cache from localStorage
if (typeof window !== 'undefined') {
  loadCache();
}

/**
 * Get cache key for coordinates (rounded to ~1km precision for cache hits)
 */
function getCacheKey(coords: [number, number]): string {
  return `${coords[0].toFixed(2)},${coords[1].toFixed(2)}`;
}

/**
 * Reverse geocode coordinates to location names
 * Uses OpenStreetMap's Nominatim API (free, no API key required)
 * Results are cached to avoid repeated API calls
 */
export async function reverseGeocode(
  coords: [number, number]
): Promise<GeoResult> {
  const cacheKey = getCacheKey(coords);

  // Check cache first
  const cached = geocodeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const [lat, lng] = coords;

  try {
    // Nominatim requires a User-Agent header
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'SituationRoom/1.0 (https://github.com/situation-room)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    const result: GeoResult = {
      country: data.address?.country || '',
      city: data.address?.city || data.address?.town || data.address?.village || data.address?.state,
      display: data.display_name || '',
    };

    // Cache the result
    geocodeCache.set(cacheKey, result);
    saveCache();

    return result;
  } catch (error) {
    // Return empty result on error rather than failing
    console.warn('Reverse geocoding failed:', error);
    return {
      country: '',
      city: undefined,
      display: '',
    };
  }
}

/**
 * Get the best location name for search queries
 * Prefers city over country for more specific results
 */
export function getLocationQueryName(geoResult: GeoResult): string {
  return geoResult.city || geoResult.country || '';
}
