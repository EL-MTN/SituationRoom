import { useQuery } from '@tanstack/react-query';
import { fetchRssFeed, parseRssFeed } from '../services';
import type { FeedItem } from '../types';
import { RSS_FEED_CONFIG } from '../constants';

interface UseRssFeedParams {
  feedUrl: string;
  pollIntervalMs?: number;
  maxItems?: number;
  enabled?: boolean;
}

export function useRssFeed({
  feedUrl,
  pollIntervalMs = RSS_FEED_CONFIG.defaultPollIntervalMs,
  maxItems = RSS_FEED_CONFIG.defaultMaxItems,
  enabled = true,
}: UseRssFeedParams) {
  return useQuery<FeedItem[], Error>({
    queryKey: ['rss-feed', feedUrl, maxItems],
    queryFn: async () => {
      if (!feedUrl) {
        return [];
      }

      const xml = await fetchRssFeed(feedUrl);
      const parsed = parseRssFeed(xml, feedUrl);

      // Limit items and sort by date (newest first)
      const items = parsed.items
        .slice(0, maxItems)
        .sort((a, b) => {
          if (!a.pubDate && !b.pubDate) return 0;
          if (!a.pubDate) return 1;
          if (!b.pubDate) return -1;
          return b.pubDate.getTime() - a.pubDate.getTime();
        });

      return items;
    },
    enabled: enabled && !!feedUrl,
    refetchInterval: pollIntervalMs > 0 ? pollIntervalMs : false,
    staleTime: Math.max(pollIntervalMs / 2, RSS_FEED_CONFIG.minPollIntervalMs / 2),
  });
}
