import type {
  WidgetType,
  WidgetInstance,
  WidgetConfig,
  WidgetLayout,
  MapWidgetConfig,
  EventFeedWidgetConfig,
} from '../types';

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

// Default widget dimensions
const DEFAULT_WIDGET_SIZE = { w: 4, h: 5, minW: 2, minH: 3 };

interface GridSettings {
  cols: number;
  rows: number;
}

/**
 * Find the first available position in the grid that can fit a widget of given size.
 * Scans row by row, column by column for the first empty space.
 */
function findFirstAvailablePosition(
  existingLayouts: WidgetLayout[],
  widgetSize: { w: number; h: number },
  grid: GridSettings
): { x: number; y: number } {
  // Create a 2D occupancy grid
  const occupied: boolean[][] = Array.from({ length: grid.rows }, () =>
    Array(grid.cols).fill(false)
  );

  // Mark cells occupied by existing widgets
  for (const layout of existingLayouts) {
    for (let row = layout.y; row < layout.y + layout.h && row < grid.rows; row++) {
      for (let col = layout.x; col < layout.x + layout.w && col < grid.cols; col++) {
        occupied[row][col] = true;
      }
    }
  }

  // Scan for first position that fits the widget
  for (let y = 0; y <= grid.rows - widgetSize.h; y++) {
    for (let x = 0; x <= grid.cols - widgetSize.w; x++) {
      // Check if all cells needed for this widget are free
      let canFit = true;
      for (let row = y; row < y + widgetSize.h && canFit; row++) {
        for (let col = x; col < x + widgetSize.w && canFit; col++) {
          if (occupied[row][col]) {
            canFit = false;
          }
        }
      }
      if (canFit) {
        return { x, y };
      }
    }
  }

  // If no space found, place at bottom (will extend grid)
  const maxY = existingLayouts.reduce((max, l) => Math.max(max, l.y + l.h), 0);
  return { x: 0, y: maxY };
}

export interface CreateWidgetOptions {
  existingLayouts?: WidgetLayout[];
  gridCols?: number;
  gridRows?: number;
}

export function createWidgetInstance(
  type: WidgetType,
  options: CreateWidgetOptions = {}
): WidgetInstance {
  const id = crypto.randomUUID();
  const { existingLayouts = [], gridCols = 24, gridRows = 16 } = options;

  let config: WidgetConfig;
  const size = { ...DEFAULT_WIDGET_SIZE };

  switch (type) {
    case 'map':
      config = { ...defaultMapConfig, id } as MapWidgetConfig;
      break;
    case 'event-feed':
      config = { ...defaultEventFeedConfig, id } as EventFeedWidgetConfig;
      break;
    default:
      throw new Error(`Unknown widget type: ${type}`);
  }

  // Find first available position
  const position = findFirstAvailablePosition(existingLayouts, size, {
    cols: gridCols,
    rows: gridRows,
  });

  const layout: WidgetInstance['layout'] = {
    i: id,
    x: position.x,
    y: position.y,
    w: size.w,
    h: size.h,
    minW: size.minW,
    minH: size.minH,
  };

  return { config, layout };
}
