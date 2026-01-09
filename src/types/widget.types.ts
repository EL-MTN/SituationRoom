/** Unique identifier for widget types */
export type WidgetType = 'map' | 'event-feed';

/** Filters applicable to all widgets */
export interface WidgetFilters {
  query?: string;
  timespan?: string;
}

/** Base configuration all widgets share */
export interface BaseWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  pollIntervalMs: number;
  filters: WidgetFilters;
}

/** Map-specific configuration */
export interface MapWidgetConfig {
  id: string;
  type: 'map';
  title: string;
  center: [number, number];
  zoom: number;
}

/** Event feed-specific configuration */
export interface EventFeedWidgetConfig extends BaseWidgetConfig {
  type: 'event-feed';
  maxItems: number;
  showImages: boolean;
  highlightKeywords: string[];
}

/** Union of all widget configs */
export type WidgetConfig = MapWidgetConfig | EventFeedWidgetConfig;

/** Layout properties for react-grid-layout */
export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

/** Widget instance with layout info */
export interface WidgetInstance {
  config: WidgetConfig;
  layout: WidgetLayout;
}

/** Widget component props interface */
export interface WidgetProps<T extends WidgetConfig = WidgetConfig> {
  config: T;
  onConfigChange: (config: Partial<T>) => void;
}
