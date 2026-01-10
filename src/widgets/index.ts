// Core exports
export { WidgetWrapper } from './core/WidgetWrapper';
export { WidgetRegistry } from './registry';
export type {
  BaseWidgetConfig,
  WidgetLayout,
  WidgetInstance,
  WidgetProps,
  WidgetHeaderExtensionProps,
  WidgetMetadata,
  WidgetDefaults,
  WidgetDefinition,
} from './registry';

// Import all widgets to trigger their self-registration
// This ensures widgets are registered when the app starts
import './map';
import './event-feed';
import './polymarket';
import './bluesky-feed';
import './youtube';
import './flight-tracker';

// Re-export widget types for convenience
export type { MapWidgetConfig } from './map';
export type { EventFeedWidgetConfig, EventFeedFilters } from './event-feed';
export type { PolymarketWidgetConfig } from './polymarket';
export type { BlueskyFeedWidgetConfig } from './bluesky-feed';
export type { YoutubeWidgetConfig } from './youtube';
export type { FlightTrackerWidgetConfig } from './flight-tracker';
