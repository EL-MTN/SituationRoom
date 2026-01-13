import { CloudSun } from 'lucide-react';
import { WidgetRegistry } from '../registry';
import { BlueskyFeedWidget } from './BlueskyFeedWidget';
import { BlueskyFeedWidgetHeader } from './BlueskyFeedWidgetHeader';
import { BlueskyFeedWidgetToolbar } from './BlueskyFeedWidgetToolbar';
import type { BlueskyFeedWidgetConfig } from './types';

WidgetRegistry.register<BlueskyFeedWidgetConfig>({
  metadata: {
    type: 'bluesky-feed',
    displayName: 'Bluesky Feed',
    description: 'Live Bluesky search results',
    icon: CloudSun,
  },
  defaults: {
    config: {
      type: 'bluesky-feed',
      title: 'Bluesky Feed',
      query: '',
      maxResults: 25,
      pollIntervalMs: 60000,
      showMedia: true,
    },
    layout: { w: 8, h: 10, minW: 3, minH: 3 },
  },
  component: BlueskyFeedWidget,
  headerActions: BlueskyFeedWidgetHeader,
  toolbarItems: BlueskyFeedWidgetToolbar,
});

export { BlueskyFeedWidget } from './BlueskyFeedWidget';
export { BlueskyFeedWidgetHeader } from './BlueskyFeedWidgetHeader';
export { BlueskyFeedWidgetToolbar } from './BlueskyFeedWidgetToolbar';
export type { BlueskyFeedWidgetConfig } from './types';
