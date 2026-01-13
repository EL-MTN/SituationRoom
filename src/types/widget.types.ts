// Re-export base types from registry
export type {
  BaseWidgetConfig,
  WidgetLayout,
  WidgetProps,
  WidgetHeaderExtensionProps,
  WidgetMetadata,
  WidgetDefaults,
  WidgetDefinition,
} from '../widgets/registry';

// Re-export widget-specific types
export type { MapWidgetConfig } from '../widgets/map/types';
export type { EventFeedWidgetConfig, EventFeedFilters } from '../widgets/event-feed/types';
export type { PolymarketWidgetConfig } from '../widgets/polymarket/types';
export type { BlueskyFeedWidgetConfig } from '../widgets/bluesky-feed/types';
export type { YoutubeWidgetConfig } from '../widgets/youtube/types';
export type { FlightTrackerWidgetConfig } from '../widgets/flight-tracker/types';
export type { NotesWidgetConfig } from '../widgets/notes/types';

// Import types for local use
import type { MapWidgetConfig } from '../widgets/map/types';
import type { EventFeedWidgetConfig } from '../widgets/event-feed/types';
import type { PolymarketWidgetConfig } from '../widgets/polymarket/types';
import type { BlueskyFeedWidgetConfig } from '../widgets/bluesky-feed/types';
import type { YoutubeWidgetConfig } from '../widgets/youtube/types';
import type { FlightTrackerWidgetConfig } from '../widgets/flight-tracker/types';
import type { NotesWidgetConfig } from '../widgets/notes/types';
import type { WidgetLayout } from '../widgets/registry';

// Union of all widget configs
export type WidgetConfig = MapWidgetConfig | EventFeedWidgetConfig | PolymarketWidgetConfig | BlueskyFeedWidgetConfig | YoutubeWidgetConfig | FlightTrackerWidgetConfig | NotesWidgetConfig;

// Widget instance with config and layout
export interface WidgetInstance {
  config: WidgetConfig;
  layout: WidgetLayout;
}
