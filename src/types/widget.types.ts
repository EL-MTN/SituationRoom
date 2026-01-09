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
export type { MapWidgetConfig } from '../widgets/map/MapWidget.types';
export type { EventFeedWidgetConfig, EventFeedFilters } from '../widgets/event-feed/EventFeedWidget.types';
export type { PolymarketWidgetConfig } from '../widgets/polymarket/PolymarketWidget.types';

// Import types for local use
import type { MapWidgetConfig } from '../widgets/map/MapWidget.types';
import type { EventFeedWidgetConfig } from '../widgets/event-feed/EventFeedWidget.types';
import type { PolymarketWidgetConfig } from '../widgets/polymarket/PolymarketWidget.types';
import type { WidgetLayout } from '../widgets/registry';

// Union of all widget configs
export type WidgetConfig = MapWidgetConfig | EventFeedWidgetConfig | PolymarketWidgetConfig;

// Widget instance with config and layout
export interface WidgetInstance {
  config: WidgetConfig;
  layout: WidgetLayout;
}
