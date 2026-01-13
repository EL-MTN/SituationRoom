import type { BaseWidgetConfig } from '../../registry';

/** Bluesky author profile */
export interface BlueskyAuthor {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

/** Bluesky post record (the actual content) */
export interface BlueskyPostRecord {
  text: string;
  createdAt: string;
  langs?: string[];
}

/** Bluesky image embed */
export interface BlueskyImage {
  thumb: string;
  fullsize: string;
  alt: string;
}

/** Bluesky embed (images, external links, etc.) */
export interface BlueskyEmbed {
  $type: string;
  images?: Array<{
    thumb: string;
    fullsize: string;
    alt: string;
  }>;
  external?: {
    uri: string;
    title: string;
    description: string;
    thumb?: string;
  };
}

/** Bluesky post view from API */
export interface BlueskyPost {
  uri: string;
  cid: string;
  author: BlueskyAuthor;
  record: BlueskyPostRecord;
  embed?: BlueskyEmbed;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  quoteCount: number;
  indexedAt: string;
}

/** Bluesky search response */
export interface BlueskySearchResponse {
  posts: BlueskyPost[];
  cursor?: string;
}

/** Normalized post for widget display */
export interface NormalizedPost {
  id: string;
  uri: string;
  text: string;
  createdAt: Date;
  author: BlueskyAuthor;
  metrics: {
    replyCount: number;
    repostCount: number;
    likeCount: number;
    quoteCount: number;
  };
  images?: Array<{
    thumb: string;
    fullsize: string;
    alt: string;
  }>;
}

/** Widget configuration */
export interface BlueskyFeedWidgetConfig extends BaseWidgetConfig {
  type: 'bluesky-feed';
  query: string;
  maxResults: number;
  pollIntervalMs: number;
  showMedia: boolean;
}
