import type { BaseWidgetConfig } from '../registry';

/** Filters for event feed */
export interface EventFeedFilters {
  query?: string;
  timespan?: string;
}

/** Event feed-specific configuration */
export interface EventFeedWidgetConfig extends BaseWidgetConfig {
  type: 'event-feed';
  pollIntervalMs: number;
  filters: EventFeedFilters;
  maxItems: number;
  showImages: boolean;
  highlightKeywords: string[];
}
