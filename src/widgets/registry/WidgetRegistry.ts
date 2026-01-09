import type {
  BaseWidgetConfig,
  WidgetDefinition,
  WidgetMetadata,
  WidgetInstance,
  WidgetLayout,
} from './types';

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

class WidgetRegistryImpl {
  private widgets = new Map<string, WidgetDefinition>();

  /**
   * Register a widget definition
   */
  register<T extends BaseWidgetConfig>(definition: WidgetDefinition<T>): void {
    if (this.widgets.has(definition.metadata.type)) {
      console.warn(
        `Widget type "${definition.metadata.type}" already registered, overwriting.`
      );
    }
    // Type assertion needed because we store all definitions as generic type
    this.widgets.set(definition.metadata.type, definition as unknown as WidgetDefinition);
  }

  /**
   * Get a widget definition by type
   */
  get(type: string): WidgetDefinition | undefined {
    return this.widgets.get(type);
  }

  /**
   * Get all registered widget definitions
   */
  getAll(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Get all metadata for widget picker UI
   */
  getAllMetadata(): WidgetMetadata[] {
    return this.getAll().map((w) => w.metadata);
  }

  /**
   * Get all registered widget types
   */
  getTypes(): string[] {
    return Array.from(this.widgets.keys());
  }

  /**
   * Check if a widget type is registered
   */
  has(type: string): boolean {
    return this.widgets.has(type);
  }

  /**
   * Create a new widget instance with proper defaults
   */
  createInstance(
    type: string,
    options: {
      existingLayouts?: WidgetLayout[];
      gridCols?: number;
      gridRows?: number;
    } = {}
  ): WidgetInstance {
    const definition = this.get(type);
    if (!definition) {
      throw new Error(`Unknown widget type: ${type}`);
    }

    const id = crypto.randomUUID();
    const { existingLayouts = [], gridCols = 24, gridRows = 16 } = options;

    const config: BaseWidgetConfig = {
      ...definition.defaults.config,
      id,
    };

    const position = findFirstAvailablePosition(
      existingLayouts,
      definition.defaults.layout,
      { cols: gridCols, rows: gridRows }
    );

    const layout: WidgetLayout = {
      i: id,
      x: position.x,
      y: position.y,
      w: definition.defaults.layout.w,
      h: definition.defaults.layout.h,
      minW: definition.defaults.layout.minW,
      minH: definition.defaults.layout.minH,
      maxW: definition.defaults.layout.maxW,
      maxH: definition.defaults.layout.maxH,
    };

    return { config, layout };
  }
}

// Singleton instance
export const WidgetRegistry = new WidgetRegistryImpl();
