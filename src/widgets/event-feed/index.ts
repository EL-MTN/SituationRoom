import { List } from 'lucide-react';
import { WidgetRegistry } from '../registry';
import { EventFeedWidget } from './EventFeedWidget';
import { EventFeedWidgetHeader } from './EventFeedWidgetHeader';
import { EventFeedWidgetToolbar } from './EventFeedWidgetToolbar';
import type { EventFeedWidgetConfig } from './types';

// Self-register on import
WidgetRegistry.register<EventFeedWidgetConfig>({
  metadata: {
    type: 'event-feed',
    displayName: 'Event Feed',
    description: 'Chronological list of news events',
    icon: List,
  },
  defaults: {
    config: {
      type: 'event-feed',
      title: 'Event Feed',
      pollIntervalMs: 60000,
      filters: {
        query: '',
        timespan: '24h',
      },
      maxItems: 100,
      showImages: true,
      highlightKeywords: [],
    },
    layout: { w: 4, h: 5, minW: 4, minH: 3 },
  },
  component: EventFeedWidget,
  headerActions: EventFeedWidgetHeader,
  toolbarItems: EventFeedWidgetToolbar,
});

// Re-export for direct usage if needed
export { EventFeedWidget } from './EventFeedWidget';
export { EventFeedWidgetHeader } from './EventFeedWidgetHeader';
export { EventFeedWidgetToolbar } from './EventFeedWidgetToolbar';
export { EventFeedSearchPopover, SettingsPopover } from './components';
export type { EventFeedWidgetConfig, EventFeedFilters } from './types';
