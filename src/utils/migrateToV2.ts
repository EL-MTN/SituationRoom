import type { FloatingWidgetInstance, FloatingWidgetPosition } from '@/types/floating.types';
import type { WidgetConfig, WidgetInstance } from '@/types/widget.types';
import type { MapWidgetConfig } from '@/widgets/map/types';
import { WidgetRegistry } from '@/widgets/registry';
import type { MapState } from '@/stores/MapDashboardContext';

// Storage keys
const V1_STORAGE_KEY = 'situation-dashboard-state';
const V2_STORAGE_KEY = 'situationroom-map-dashboard-v2';

interface V1StoredState {
  version: number;
  dashboards: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    widgets: WidgetInstance[];
    settings: {
      defaultPollIntervalMs: number;
      theme: 'light' | 'dark' | 'system';
      gridCols: number;
      gridRows: number;
      showGridLines: boolean;
    };
  }[];
  activeDashboardId: string | null;
}

interface V2State {
  id: string;
  name: string;
  mapState: MapState;
  pins: [];
  floatingWidgets: FloatingWidgetInstance[];
  maxZIndex: number;
}

/**
 * Check if there's existing v1 data to migrate
 */
export function hasV1Data(): boolean {
  try {
    const stored = localStorage.getItem(V1_STORAGE_KEY);
    return stored !== null;
  } catch {
    return false;
  }
}

/**
 * Check if there's existing v2 data
 */
export function hasV2Data(): boolean {
  try {
    const stored = localStorage.getItem(V2_STORAGE_KEY);
    return stored !== null;
  } catch {
    return false;
  }
}

/**
 * Migrate v1 grid-based dashboard to v2 map-centric dashboard
 * Returns the migrated state or null if migration fails
 */
export function migrateV1ToV2(): V2State | null {
  try {
    const stored = localStorage.getItem(V1_STORAGE_KEY);
    if (!stored) return null;

    const v1State: V1StoredState = JSON.parse(stored);
    const activeDashboard = v1State.dashboards.find(
      (d) => d.id === v1State.activeDashboardId
    ) || v1State.dashboards[0];

    if (!activeDashboard) return null;

    // Extract map widget to use as background map state
    const mapWidget = activeDashboard.widgets.find(
      (w) => w.config.type === 'map'
    );

    // Determine map state from map widget or use defaults
    let mapState: MapState = {
      center: [39.8283, -98.5795], // Default: center of US
      zoom: 4,
    };

    if (mapWidget) {
      const mapConfig = mapWidget.config as MapWidgetConfig;
      mapState = {
        center: mapConfig.center,
        zoom: mapConfig.zoom,
      };
    }

    // Convert non-map widgets to floating widgets
    const floatingWidgets: FloatingWidgetInstance[] = [];
    let maxZIndex = 20;

    const gridCols = activeDashboard.settings.gridCols || 24;
    const gridRows = activeDashboard.settings.gridRows || 16;

    // Calculate cell size based on viewport (use reasonable defaults)
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const cellWidth = viewportWidth / gridCols;
    const cellHeight = viewportHeight / gridRows;

    activeDashboard.widgets.forEach((widget, index) => {
      // Skip map widget - it becomes the background
      if (widget.config.type === 'map') return;

      const definition = WidgetRegistry.get(widget.config.type);
      const floatingDefaults = definition?.floatingDefaults;

      // Convert grid position to pixel position
      const x = Math.round(widget.layout.x * cellWidth);
      const y = Math.round(widget.layout.y * cellHeight);

      // Use floatingDefaults if available, otherwise calculate from grid layout
      const width = floatingDefaults?.width ?? Math.round(widget.layout.w * cellWidth);
      const height = floatingDefaults?.height ?? Math.round(widget.layout.h * cellHeight);

      const position: FloatingWidgetPosition = {
        id: widget.config.id,
        x: Math.max(50, x), // Ensure minimum offset
        y: Math.max(50, y),
        width: Math.max(200, width),
        height: Math.max(150, height),
        zIndex: 20 + index,
        isMinimized: false,
      };

      maxZIndex = Math.max(maxZIndex, position.zIndex);

      floatingWidgets.push({
        config: widget.config as WidgetConfig,
        position,
      });
    });

    const v2State: V2State = {
      id: 'map-dashboard',
      name: activeDashboard.name,
      mapState,
      pins: [],
      floatingWidgets,
      maxZIndex,
    };

    return v2State;
  } catch (error) {
    console.error('Failed to migrate v1 to v2:', error);
    return null;
  }
}

/**
 * Run migration and save to v2 storage
 */
export function runMigration(): boolean {
  const migrated = migrateV1ToV2();
  if (!migrated) return false;

  try {
    localStorage.setItem(V2_STORAGE_KEY, JSON.stringify(migrated));
    return true;
  } catch (error) {
    console.error('Failed to save migrated state:', error);
    return false;
  }
}

/**
 * Clear v1 data after successful migration
 * (Keep it for now as backup - can be called manually)
 */
export function clearV1Data(): void {
  try {
    localStorage.removeItem(V1_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear v1 data:', error);
  }
}
