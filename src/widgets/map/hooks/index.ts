import { useQuery } from '@tanstack/react-query';
import { fetchGdeltGeo } from '../services';
import type { GdeltGeoFeature } from '../types';
import { GDELT_GEO_CONFIG } from '../constants';

interface UseGdeltGeoEventsParams {
  query?: string;
  location?: string | null;
  center?: [number, number] | null; // [lat, lng] for geographic filtering
  zoom?: number;
  timespan?: string;
  enabled?: boolean;
}

// Calculate distance between two points in km (Haversine formula)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get filter radius based on zoom level (higher zoom = smaller radius)
function getFilterRadiusKm(zoom: number): number {
  // Approximate visible radius at different zoom levels
  const radiusMap: Record<number, number> = {
    2: 10000,  // World view
    3: 5000,
    4: 3000,
    5: 2000,   // Country level
    6: 1500,
    7: 1000,   // State/region level
    8: 500,
    9: 300,
    10: 200,   // City level
    11: 100,
    12: 50,
    13: 25,
    14: 15,
  };
  return radiusMap[Math.min(Math.max(zoom, 2), 14)] || 1000;
}

// Filter features by geographic proximity to center point
function filterFeaturesByProximity(
  features: GdeltGeoFeature[],
  center: [number, number],
  zoom: number
): GdeltGeoFeature[] {
  const [centerLat, centerLng] = center;
  const maxRadius = getFilterRadiusKm(zoom);

  return features.filter((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const distance = getDistanceKm(centerLat, centerLng, lat, lng);
    return distance <= maxRadius;
  });
}

export function useGdeltGeoEvents({
  query = GDELT_GEO_CONFIG.geo.defaultQuery,
  location,
  center,
  zoom = 2,
  timespan = GDELT_GEO_CONFIG.geo.defaultTimespan,
  enabled = true,
}: UseGdeltGeoEventsParams = {}) {
  // Build query with location filter if provided (ensure location is a valid non-empty string)
  const validLocation = location && typeof location === 'string' && location.trim().length > 0
    ? location.trim()
    : null;

  // GDELT requires OR terms to be wrapped in parentheses when combined with other terms
  const baseQuery = query.includes(' OR ') ? `(${query})` : query;

  // GDELT rejects quoted phrases that are too short (< 5 chars)
  // Use quotes only for multi-word locations or longer names
  const locationFilter = validLocation
    ? (validLocation.includes(' ') || validLocation.length >= 5 ? `"${validLocation}"` : validLocation)
    : null;

  const fullQuery = locationFilter
    ? `${baseQuery} ${locationFilter}`
    : baseQuery;

  return useQuery<GdeltGeoFeature[], Error>({
    queryKey: ['gdelt-geo', fullQuery, timespan, center?.[0], center?.[1], zoom],
    queryFn: async () => {
      const response = await fetchGdeltGeo({ query: fullQuery, timespan });
      const features = response.features || [];

      // If center is provided and not world view, filter by geographic proximity
      if (center && zoom > 2) {
        return filterFeaturesByProximity(features, center, zoom);
      }

      return features;
    },
    enabled,
    refetchInterval: GDELT_GEO_CONFIG.geo.pollIntervalMs,
    staleTime: GDELT_GEO_CONFIG.geo.pollIntervalMs / 2,
  });
}
