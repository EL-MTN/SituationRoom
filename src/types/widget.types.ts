/** Unique identifier for widget types */
export type WidgetType = 'map' | 'event-feed';

/** Filters applicable to all widgets */
export interface WidgetFilters {
  query?: string;
  timespan?: string;
  sourceLang?: string;
  sourceCountry?: string;
  toneMin?: number;
  toneMax?: number;
}

/** Base configuration all widgets share */
export interface BaseWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  pollIntervalMs: number;
  filters: WidgetFilters;
}

/** Bounding box for geographic filtering */
export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** Map-specific configuration */
export interface MapWidgetConfig extends BaseWidgetConfig {
  type: 'map';
  center: [number, number];
  zoom: number;
  showClustering: boolean;
  boundingBox?: BoundingBox;
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
  isEditing: boolean;
}

/** Widget definition for registry */
export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  component: React.ComponentType<WidgetProps<any>>;
  defaultConfig: Omit<BaseWidgetConfig, 'id'>;
  defaultLayout: Omit<WidgetLayout, 'i'>;
}
