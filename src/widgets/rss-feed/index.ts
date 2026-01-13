import { Rss } from 'lucide-react';
import { WidgetRegistry } from '../registry';
import { RssFeedWidget } from './RssFeedWidget';
import { RssFeedWidgetHeader } from './RssFeedWidgetHeader';
import { RssFeedWidgetToolbar } from './RssFeedWidgetToolbar';
import type { RssFeedWidgetConfig } from './types';
import { RSS_FEED_CONFIG } from './constants';

// Self-register on import
WidgetRegistry.register<RssFeedWidgetConfig>({
  metadata: {
    type: 'rss-feed',
    displayName: 'RSS Feed',
    description: 'Display items from an RSS or Atom feed',
    icon: Rss,
  },
  defaults: {
    config: {
      type: 'rss-feed',
      title: 'RSS Feed',
      feedUrl: '',
      pollIntervalMs: RSS_FEED_CONFIG.defaultPollIntervalMs,
      maxItems: RSS_FEED_CONFIG.defaultMaxItems,
    },
    layout: { w: 4, h: 5, minW: 3, minH: 3 },
  },
  component: RssFeedWidget,
  headerActions: RssFeedWidgetHeader,
  toolbarItems: RssFeedWidgetToolbar,
});

// Re-export for direct usage if needed
export { RssFeedWidget } from './RssFeedWidget';
export { RssFeedWidgetHeader } from './RssFeedWidgetHeader';
export { RssFeedWidgetToolbar } from './RssFeedWidgetToolbar';
export { SettingsPopover } from './components';
export type { RssFeedWidgetConfig, FeedItem, ParsedFeed } from './types';
