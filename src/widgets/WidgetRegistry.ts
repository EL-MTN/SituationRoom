import type {
  WidgetType,
  WidgetDefinition,
  WidgetInstance,
  WidgetConfig,
  MapWidgetConfig,
  EventFeedWidgetConfig,
} from '../types';

// Lazy imports to avoid circular dependencies
type WidgetComponent = React.ComponentType<any>;

const widgetDefinitions: Map<WidgetType, WidgetDefinition> = new Map();
const widgetComponents: Map<WidgetType, WidgetComponent> = new Map();

// Default configs for each widget type
const defaultMapConfig: Omit<MapWidgetConfig, 'id'> = {
  type: 'map',
  title: 'Map',
  pollIntervalMs: 60000,
  filters: {
    query: '',
    timespan: '24h',
  },
  center: [20, 0],
  zoom: 2,
  showClustering: true,
};

const defaultEventFeedConfig: Omit<EventFeedWidgetConfig, 'id'> = {
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
};

// Register widget definitions
export function registerWidget(definition: WidgetDefinition, component: WidgetComponent) {
  widgetDefinitions.set(definition.type, definition);
  widgetComponents.set(definition.type, component);
}

export function getWidgetDefinition(type: WidgetType): WidgetDefinition | undefined {
  return widgetDefinitions.get(type);
}

export function getWidgetComponent(type: WidgetType): WidgetComponent | undefined {
  return widgetComponents.get(type);
}

export function getAllWidgetDefinitions(): WidgetDefinition[] {
  return Array.from(widgetDefinitions.values());
}

export function createWidgetInstance(type: WidgetType): WidgetInstance {
  const id = crypto.randomUUID();

  let config: WidgetConfig;
  let layout: WidgetInstance['layout'];

  switch (type) {
    case 'map':
      config = { ...defaultMapConfig, id } as MapWidgetConfig;
      layout = { i: id, x: 0, y: 0, w: 4, h: 5, minW: 2, minH: 3 };
      break;
    case 'event-feed':
      config = { ...defaultEventFeedConfig, id } as EventFeedWidgetConfig;
      layout = { i: id, x: 4, y: 0, w: 4, h: 5, minW: 2, minH: 3 };
      break;
    default:
      throw new Error(`Unknown widget type: ${type}`);
  }

  return { config, layout };
}
