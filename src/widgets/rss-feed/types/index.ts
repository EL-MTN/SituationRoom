import type { BaseWidgetConfig } from '../../registry';

/** RSS feed widget configuration */
export interface RssFeedWidgetConfig extends BaseWidgetConfig {
  type: 'rss-feed';
  feedUrl: string;
  pollIntervalMs: number;
  maxItems: number;
}

/** Normalized feed item */
export interface FeedItem {
  id: string;
  title: string;
  link: string;
  description?: string;
  pubDate?: Date;
  author?: string;
  imageUrl?: string;
  sourceName?: string;
}

/** Raw parsed feed data */
export interface ParsedFeed {
  title: string;
  description?: string;
  link?: string;
  items: FeedItem[];
}
