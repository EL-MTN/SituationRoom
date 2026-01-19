'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { MapPin, LocationContext, LinkedWidgetConfig } from '@/types/pin.types';
import type { FloatingWidgetInstance, FloatingWidgetPosition } from '@/types/floating.types';
import type { BaseWidgetConfig } from '@/widgets/registry/types';
import type { WidgetConfig } from '@/types/widget.types';
import { WidgetRegistry } from '@/widgets/registry';

// Map state
export interface MapState {
  center: [number, number];
  zoom: number;
}

// Dashboard state
interface MapDashboardState {
  id: string;
  name: string;
  mapState: MapState;
  pins: MapPin[];
  floatingWidgets: FloatingWidgetInstance[];
  maxZIndex: number;
}

// Actions
type MapDashboardAction =
  | { type: 'SET_MAP_STATE'; payload: MapState }
  | { type: 'ADD_PIN'; payload: MapPin }
  | { type: 'UPDATE_PIN'; payload: { id: string; updates: Partial<MapPin> } }
  | { type: 'DELETE_PIN'; payload: { id: string } }
  | { type: 'LINK_WIDGET_TO_PIN'; payload: { pinId: string; linkedConfig: LinkedWidgetConfig } }
  | { type: 'UNLINK_WIDGET_FROM_PIN'; payload: { pinId: string; widgetType: string } }
  | { type: 'ADD_FLOATING_WIDGET'; payload: FloatingWidgetInstance }
  | { type: 'REMOVE_FLOATING_WIDGET'; payload: { id: string } }
  | { type: 'UPDATE_WIDGET_POSITION'; payload: { id: string; position: Partial<FloatingWidgetPosition> } }
  | { type: 'UPDATE_WIDGET_CONFIG'; payload: { id: string; config: Partial<BaseWidgetConfig> } }
  | { type: 'BRING_TO_FRONT'; payload: { id: string } }
  | { type: 'MINIMIZE_WIDGET'; payload: { id: string } }
  | { type: 'RESTORE_WIDGET'; payload: { id: string } }
  | { type: 'LOAD_FROM_STORAGE'; payload: { state: MapDashboardState } };

const DEFAULT_MAP_STATE: MapState = {
  center: [39.8283, -98.5795], // Center of US
  zoom: 4,
};

const DEFAULT_DASHBOARD_ID = 'map-dashboard';
const STORAGE_KEY = 'situationroom-map-dashboard-v2';

const initialState: MapDashboardState = {
  id: DEFAULT_DASHBOARD_ID,
  name: 'Map Dashboard',
  mapState: DEFAULT_MAP_STATE,
  pins: [],
  floatingWidgets: [],
  maxZIndex: 20,
};

function mapDashboardReducer(
  state: MapDashboardState,
  action: MapDashboardAction
): MapDashboardState {
  switch (action.type) {
    case 'SET_MAP_STATE':
      return { ...state, mapState: action.payload };

    case 'ADD_PIN':
      return { ...state, pins: [...state.pins, action.payload] };

    case 'UPDATE_PIN':
      return {
        ...state,
        pins: state.pins.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };

    case 'DELETE_PIN':
      return {
        ...state,
        pins: state.pins.filter((p) => p.id !== action.payload.id),
        // Also close any widgets pinned to this pin
        floatingWidgets: state.floatingWidgets.filter(
          (w) => w.position.pinnedToPin !== action.payload.id
        ),
      };

    case 'LINK_WIDGET_TO_PIN':
      return {
        ...state,
        pins: state.pins.map((p) =>
          p.id === action.payload.pinId
            ? {
                ...p,
                linkedWidgetConfigs: [...p.linkedWidgetConfigs, action.payload.linkedConfig],
              }
            : p
        ),
      };

    case 'UNLINK_WIDGET_FROM_PIN':
      return {
        ...state,
        pins: state.pins.map((p) =>
          p.id === action.payload.pinId
            ? {
                ...p,
                linkedWidgetConfigs: p.linkedWidgetConfigs.filter(
                  (c) => c.widgetType !== action.payload.widgetType
                ),
              }
            : p
        ),
      };

    case 'ADD_FLOATING_WIDGET': {
      const newZIndex = state.maxZIndex + 1;
      return {
        ...state,
        floatingWidgets: [
          ...state.floatingWidgets,
          {
            ...action.payload,
            position: { ...action.payload.position, zIndex: newZIndex },
          },
        ],
        maxZIndex: newZIndex,
      };
    }

    case 'REMOVE_FLOATING_WIDGET':
      return {
        ...state,
        floatingWidgets: state.floatingWidgets.filter(
          (w) => w.config.id !== action.payload.id
        ),
      };

    case 'UPDATE_WIDGET_POSITION':
      return {
        ...state,
        floatingWidgets: state.floatingWidgets.map((w) =>
          w.config.id === action.payload.id
            ? { ...w, position: { ...w.position, ...action.payload.position } }
            : w
        ),
      };

    case 'UPDATE_WIDGET_CONFIG':
      return {
        ...state,
        floatingWidgets: state.floatingWidgets.map((w) =>
          w.config.id === action.payload.id
            ? { ...w, config: { ...w.config, ...action.payload.config } as WidgetConfig }
            : w
        ),
      };

    case 'BRING_TO_FRONT': {
      const newZIndex = state.maxZIndex + 1;
      return {
        ...state,
        floatingWidgets: state.floatingWidgets.map((w) =>
          w.config.id === action.payload.id
            ? { ...w, position: { ...w.position, zIndex: newZIndex } }
            : w
        ),
        maxZIndex: newZIndex,
      };
    }

    case 'MINIMIZE_WIDGET':
      return {
        ...state,
        floatingWidgets: state.floatingWidgets.map((w) =>
          w.config.id === action.payload.id
            ? { ...w, position: { ...w.position, isMinimized: true } }
            : w
        ),
      };

    case 'RESTORE_WIDGET': {
      const newZIndex = state.maxZIndex + 1;
      return {
        ...state,
        floatingWidgets: state.floatingWidgets.map((w) =>
          w.config.id === action.payload.id
            ? { ...w, position: { ...w.position, isMinimized: false, zIndex: newZIndex } }
            : w
        ),
        maxZIndex: newZIndex,
      };
    }

    case 'LOAD_FROM_STORAGE':
      return action.payload.state;

    default:
      return state;
  }
}

// Serialization helpers
function serializeState(state: MapDashboardState): string {
  return JSON.stringify(state);
}

function deserializeState(json: string): MapDashboardState | null {
  try {
    const parsed = JSON.parse(json);
    return parsed as MapDashboardState;
  } catch {
    return null;
  }
}

// Context
interface MapDashboardContextValue {
  state: MapDashboardState;
  setMapState: (mapState: MapState) => void;
  addPin: (coordinates: [number, number], label: string, color?: string) => string;
  updatePin: (id: string, updates: Partial<MapPin>) => void;
  deletePin: (id: string) => void;
  linkWidgetToPin: (pinId: string, widgetType: string, configOverrides?: Record<string, unknown>) => void;
  unlinkWidgetFromPin: (pinId: string, widgetType: string) => void;
  addFloatingWidget: (type: string, options?: {
    x?: number;
    y?: number;
    locationContext?: LocationContext;
  }) => void;
  removeFloatingWidget: (id: string) => void;
  updateWidgetPosition: (id: string, position: Partial<FloatingWidgetPosition>) => void;
  updateWidgetConfig: (id: string, config: Partial<BaseWidgetConfig>) => void;
  bringToFront: (id: string) => void;
  minimizeWidget: (id: string) => void;
  restoreWidget: (id: string) => void;
  openPinWidgets: (pinId: string) => void;
}

const MapDashboardContext = createContext<MapDashboardContextValue | null>(null);

// Provider
export function MapDashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mapDashboardReducer, initialState);
  const hasLoadedFromStorage = useRef(false);
  const isFirstRender = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = deserializeState(saved);
      if (parsed) {
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: { state: parsed } });
      }
    }
    hasLoadedFromStorage.current = true;
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!hasLoadedFromStorage.current) return;
    localStorage.setItem(STORAGE_KEY, serializeState(state));
  }, [state]);

  const setMapState = useCallback((mapState: MapState) => {
    dispatch({ type: 'SET_MAP_STATE', payload: mapState });
  }, []);

  const addPin = useCallback((coordinates: [number, number], label: string, color?: string) => {
    const id = crypto.randomUUID();
    const pin: MapPin = {
      id,
      coordinates,
      label,
      color,
      linkedWidgetConfigs: [],
    };
    dispatch({ type: 'ADD_PIN', payload: pin });
    return id;
  }, []);

  const updatePin = useCallback((id: string, updates: Partial<MapPin>) => {
    dispatch({ type: 'UPDATE_PIN', payload: { id, updates } });
  }, []);

  const deletePin = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PIN', payload: { id } });
  }, []);

  const linkWidgetToPin = useCallback(
    (pinId: string, widgetType: string, configOverrides?: Record<string, unknown>) => {
      dispatch({
        type: 'LINK_WIDGET_TO_PIN',
        payload: { pinId, linkedConfig: { widgetType, configOverrides } },
      });
    },
    []
  );

  const unlinkWidgetFromPin = useCallback((pinId: string, widgetType: string) => {
    dispatch({ type: 'UNLINK_WIDGET_FROM_PIN', payload: { pinId, widgetType } });
  }, []);

  const addFloatingWidget = useCallback(
    (
      type: string,
      options?: { x?: number; y?: number; locationContext?: LocationContext }
    ) => {
      const definition = WidgetRegistry.get(type);
      if (!definition) return;

      const id = crypto.randomUUID();
      const defaults = definition.defaults;
      const floatingDefaults = definition.floatingDefaults;

      // Calculate position
      const width = floatingDefaults?.width ?? 400;
      const height = floatingDefaults?.height ?? 300;
      const x = options?.x ?? Math.max(50, Math.random() * 200);
      const y = options?.y ?? Math.max(50, Math.random() * 100);

      // Apply location config if widget supports it and context is provided
      let config = { ...defaults.config, id } as WidgetConfig;
      if (options?.locationContext && definition.getLocationConfig) {
        const locationConfig = definition.getLocationConfig(options.locationContext);
        config = { ...config, ...locationConfig } as WidgetConfig;
      }

      const widget: FloatingWidgetInstance = {
        config,
        position: {
          id,
          x,
          y,
          width,
          height,
          zIndex: state.maxZIndex + 1,
          isMinimized: false,
          pinnedToPin: options?.locationContext?.pinId,
        },
        locationContext: options?.locationContext,
      };

      dispatch({ type: 'ADD_FLOATING_WIDGET', payload: widget });
    },
    [state.maxZIndex]
  );

  const removeFloatingWidget = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FLOATING_WIDGET', payload: { id } });
  }, []);

  const updateWidgetPosition = useCallback(
    (id: string, position: Partial<FloatingWidgetPosition>) => {
      dispatch({ type: 'UPDATE_WIDGET_POSITION', payload: { id, position } });
    },
    []
  );

  const updateWidgetConfig = useCallback((id: string, config: Partial<BaseWidgetConfig>) => {
    dispatch({ type: 'UPDATE_WIDGET_CONFIG', payload: { id, config } });
  }, []);

  const bringToFront = useCallback((id: string) => {
    dispatch({ type: 'BRING_TO_FRONT', payload: { id } });
  }, []);

  const minimizeWidget = useCallback((id: string) => {
    dispatch({ type: 'MINIMIZE_WIDGET', payload: { id } });
  }, []);

  const restoreWidget = useCallback((id: string) => {
    dispatch({ type: 'RESTORE_WIDGET', payload: { id } });
  }, []);

  // Open all widgets linked to a pin
  const openPinWidgets = useCallback(
    (pinId: string) => {
      const pin = state.pins.find((p) => p.id === pinId);
      if (!pin) return;

      const locationContext: LocationContext = {
        pinId: pin.id,
        coordinates: pin.coordinates,
        label: pin.label,
        radius: 50, // Default radius in km
      };

      // Calculate positions in a fan layout around a central point
      const baseX = 100;
      const baseY = 100;
      const offsetX = 30;
      const offsetY = 30;

      pin.linkedWidgetConfigs.forEach((linked, index) => {
        // Check if widget of this type is already open for this pin
        const existingWidget = state.floatingWidgets.find(
          (w) =>
            w.config.type === linked.widgetType && w.position.pinnedToPin === pinId
        );

        if (existingWidget) {
          // Just bring it to front and restore if minimized
          if (existingWidget.position.isMinimized) {
            restoreWidget(existingWidget.config.id);
          } else {
            bringToFront(existingWidget.config.id);
          }
        } else {
          // Create new widget
          addFloatingWidget(linked.widgetType, {
            x: baseX + index * offsetX,
            y: baseY + index * offsetY,
            locationContext,
          });
        }
      });
    },
    [state.pins, state.floatingWidgets, addFloatingWidget, bringToFront, restoreWidget]
  );

  const value: MapDashboardContextValue = {
    state,
    setMapState,
    addPin,
    updatePin,
    deletePin,
    linkWidgetToPin,
    unlinkWidgetFromPin,
    addFloatingWidget,
    removeFloatingWidget,
    updateWidgetPosition,
    updateWidgetConfig,
    bringToFront,
    minimizeWidget,
    restoreWidget,
    openPinWidgets,
  };

  return (
    <MapDashboardContext.Provider value={value}>{children}</MapDashboardContext.Provider>
  );
}

// Hook
export function useMapDashboard() {
  const context = useContext(MapDashboardContext);
  if (!context) {
    throw new Error('useMapDashboard must be used within a MapDashboardProvider');
  }
  return context;
}
