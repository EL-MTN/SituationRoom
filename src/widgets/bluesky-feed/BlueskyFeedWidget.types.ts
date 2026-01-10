import type { BaseWidgetConfig } from '../registry';

export interface BlueskyFeedWidgetConfig extends BaseWidgetConfig {
  type: 'bluesky-feed';
  query: string;
  maxResults: number;
  pollIntervalMs: number;
  showMedia: boolean;
}
