import { useQuery } from '@tanstack/react-query';
import { fetchGdeltDoc, transformDocResponse } from '../services/gdelt';
import type { NormalizedEvent, WidgetFilters } from '../types';
import { GDELT_CONFIG } from '../constants';

interface UseGdeltEventsParams {
  filters: WidgetFilters;
  timespan?: string;
  maxRecords?: number;
  pollIntervalMs?: number;
  enabled?: boolean;
}

export function useGdeltEvents({
  filters,
  timespan,
  maxRecords,
  pollIntervalMs = GDELT_CONFIG.defaultPollIntervalMs,
  enabled = true,
}: UseGdeltEventsParams) {
  return useQuery<NormalizedEvent[], Error>({
    queryKey: ['gdelt-doc', filters, timespan, maxRecords],
    queryFn: async () => {
      const response = await fetchGdeltDoc({
        filters,
        timespan,
        maxRecords,
      });
      return transformDocResponse(response.articles);
    },
    enabled,
    refetchInterval: pollIntervalMs > 0 ? pollIntervalMs : false,
    staleTime: Math.max(pollIntervalMs / 2, GDELT_CONFIG.minPollIntervalMs / 2),
  });
}
