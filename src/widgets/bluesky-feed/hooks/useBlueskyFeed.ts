import { useQuery } from '@tanstack/react-query';
import { searchPosts } from '../services';
import type { NormalizedPost } from '../types';
import { BLUESKY_CONFIG } from '../constants';

interface UseBlueskyFeedParams {
  query: string;
  maxResults?: number;
  pollIntervalMs?: number;
  enabled?: boolean;
}

export function useBlueskyFeed({
  query,
  maxResults = BLUESKY_CONFIG.defaults.maxResults,
  pollIntervalMs = BLUESKY_CONFIG.defaults.pollIntervalMs,
  enabled = true,
}: UseBlueskyFeedParams) {
  return useQuery<NormalizedPost[], Error>({
    queryKey: ['bluesky-feed', query, maxResults],
    queryFn: async () => {
      if (!query.trim()) return [];
      return searchPosts({ query, limit: maxResults });
    },
    enabled: enabled && query.trim().length > 0,
    refetchInterval: pollIntervalMs,
    staleTime: pollIntervalMs,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
