import { useQuery } from '@tanstack/react-query';
import { fetchEvent, fetchPriceHistory, searchMarkets } from '../services/polymarket';
import type { PolymarketEvent, PolymarketPricePoint, PolymarketSearchResult } from '../types';
import { POLYMARKET_CONFIG } from '../constants';

interface UsePolymarketEventParams {
  slug: string | null;
  enabled?: boolean;
}

/** Hook to fetch a single Polymarket event with live updates */
export function usePolymarketEvent({
  slug,
  enabled = true,
}: UsePolymarketEventParams) {
  return useQuery<PolymarketEvent | null, Error>({
    queryKey: ['polymarket-event', slug],
    queryFn: async () => {
      if (!slug) return null;
      return fetchEvent(slug);
    },
    enabled: enabled && !!slug,
    refetchInterval: POLYMARKET_CONFIG.pollIntervalMs,
    staleTime: POLYMARKET_CONFIG.pollIntervalMs / 2,
  });
}

interface UsePolymarketPriceHistoryParams {
  marketId: string | null;
  interval?: 'hour' | 'day' | 'week';
  enabled?: boolean;
}

/** Hook to fetch price history for a market */
export function usePolymarketPriceHistory({
  marketId,
  interval = 'day',
  enabled = true,
}: UsePolymarketPriceHistoryParams) {
  return useQuery<PolymarketPricePoint[], Error>({
    queryKey: ['polymarket-price-history', marketId, interval],
    queryFn: async () => {
      if (!marketId) return [];
      return fetchPriceHistory(marketId, interval);
    },
    enabled: enabled && !!marketId,
    staleTime: 60000, // 1 minute
  });
}

interface UsePolymarketSearchParams {
  query: string;
  enabled?: boolean;
}

/** Hook to search for markets */
export function usePolymarketSearch({
  query,
  enabled = true,
}: UsePolymarketSearchParams) {
  return useQuery<PolymarketSearchResult[], Error>({
    queryKey: ['polymarket-search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      return searchMarkets(query);
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 30000, // 30 seconds
  });
}
