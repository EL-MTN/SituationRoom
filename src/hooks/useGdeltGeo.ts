import { useQuery } from '@tanstack/react-query';
import { fetchGdeltGeo, transformGeoResponse } from '../services/gdelt';
import type { GeoEvent, WidgetFilters } from '../types';
import { GDELT_CONFIG } from '../constants';

interface UseGdeltGeoParams {
  filters: WidgetFilters;
  timespan?: string;
  maxPoints?: number;
  pollIntervalMs?: number;
  enabled?: boolean;
}

export function useGdeltGeo({
  filters,
  timespan,
  maxPoints,
  pollIntervalMs = GDELT_CONFIG.defaultPollIntervalMs,
  enabled = true,
}: UseGdeltGeoParams) {
  return useQuery<GeoEvent[], Error>({
    queryKey: ['gdelt-geo', filters, timespan, maxPoints],
    queryFn: async () => {
      const response = await fetchGdeltGeo({
        filters,
        timespan,
        maxPoints,
      });
      return transformGeoResponse(response.features);
    },
    enabled,
    refetchInterval: pollIntervalMs > 0 ? pollIntervalMs : false,
    staleTime: Math.max(pollIntervalMs / 2, GDELT_CONFIG.minPollIntervalMs / 2),
  });
}
