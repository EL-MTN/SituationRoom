import type { BaseWidgetConfig } from '../../registry';

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

/** GDELT DOC API article response */
export interface GdeltDocArticle {
  url: string;
  url_mobile: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

/** GDELT DOC API response wrapper */
export interface GdeltDocResponse {
  articles: GdeltDocArticle[];
}
