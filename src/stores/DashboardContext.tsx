import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  Dashboard,
  DashboardSettings,
  WidgetConfig,
  WidgetLayout,
  WidgetType,
} from '../types';
import { createWidgetInstance } from '../widgets/WidgetRegistry';

// State
interface DashboardState {
  dashboards: Dashboard[];
  activeDashboardId: string | null;
}

// Actions
type DashboardAction =
  | { type: 'CREATE_DASHBOARD'; payload: { id: string; name: string } }
  | { type: 'DELETE_DASHBOARD'; payload: { id: string } }
  | { type: 'SET_ACTIVE_DASHBOARD'; payload: { id: string } }
  | { type: 'UPDATE_SETTINGS'; payload: { id: string; settings: Partial<DashboardSettings> } }
  | { type: 'ADD_WIDGET'; payload: { dashboardId: string; widget: ReturnType<typeof createWidgetInstance> } }
  | { type: 'REMOVE_WIDGET'; payload: { dashboardId: string; widgetId: string } }
  | { type: 'UPDATE_WIDGET_CONFIG'; payload: { dashboardId: string; widgetId: string; config: Partial<WidgetConfig> } }
  | { type: 'UPDATE_LAYOUTS'; payload: { dashboardId: string; layouts: WidgetLayout[] } };

const DEFAULT_SETTINGS: DashboardSettings = {
  defaultPollIntervalMs: 60000,
  theme: 'system',
  gridCols: 24,
  gridRows: 16,
  showGridLines: true,
};

const DEFAULT_DASHBOARD_ID = 'default-dashboard';

const initialState: DashboardState = {
  dashboards: [
    {
      id: DEFAULT_DASHBOARD_ID,
      name: 'Dashboard',
      createdAt: new Date(),
      updatedAt: new Date(),
      widgets: [],
      settings: { ...DEFAULT_SETTINGS },
    },
  ],
  activeDashboardId: DEFAULT_DASHBOARD_ID,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'CREATE_DASHBOARD': {
      const newDashboard: Dashboard = {
        id: action.payload.id,
        name: action.payload.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgets: [],
        settings: { ...DEFAULT_SETTINGS },
      };
      return {
        ...state,
        dashboards: [...state.dashboards, newDashboard],
        activeDashboardId: action.payload.id,
      };
    }

    case 'DELETE_DASHBOARD': {
      const filtered = state.dashboards.filter((d) => d.id !== action.payload.id);
      return {
        ...state,
        dashboards: filtered,
        activeDashboardId:
          state.activeDashboardId === action.payload.id
            ? filtered[0]?.id || null
            : state.activeDashboardId,
      };
    }

    case 'SET_ACTIVE_DASHBOARD':
      return { ...state, activeDashboardId: action.payload.id };

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        dashboards: state.dashboards.map((d) =>
          d.id === action.payload.id
            ? { ...d, settings: { ...d.settings, ...action.payload.settings }, updatedAt: new Date() }
            : d
        ),
      };
    }

    case 'ADD_WIDGET': {
      return {
        ...state,
        dashboards: state.dashboards.map((d) =>
          d.id === action.payload.dashboardId
            ? { ...d, widgets: [...d.widgets, action.payload.widget], updatedAt: new Date() }
            : d
        ),
      };
    }

    case 'REMOVE_WIDGET': {
      return {
        ...state,
        dashboards: state.dashboards.map((d) =>
          d.id === action.payload.dashboardId
            ? {
                ...d,
                widgets: d.widgets.filter((w) => w.config.id !== action.payload.widgetId),
                updatedAt: new Date(),
              }
            : d
        ),
      };
    }

    case 'UPDATE_WIDGET_CONFIG': {
      return {
        ...state,
        dashboards: state.dashboards.map((d) =>
          d.id === action.payload.dashboardId
            ? {
                ...d,
                widgets: d.widgets.map((w) =>
                  w.config.id === action.payload.widgetId
                    ? { ...w, config: { ...w.config, ...action.payload.config } as WidgetConfig }
                    : w
                ),
                updatedAt: new Date(),
              }
            : d
        ),
      };
    }

    case 'UPDATE_LAYOUTS': {
      return {
        ...state,
        dashboards: state.dashboards.map((d) =>
          d.id === action.payload.dashboardId
            ? {
                ...d,
                widgets: d.widgets.map((w) => {
                  const newLayout = action.payload.layouts.find((l) => l.i === w.config.id);
                  return newLayout ? { ...w, layout: newLayout } : w;
                }),
                updatedAt: new Date(),
              }
            : d
        ),
      };
    }

    default:
      return state;
  }
}

// Context
interface DashboardContextValue {
  state: DashboardState;
  activeDashboard: Dashboard | null;
  createDashboard: (name: string) => string;
  deleteDashboard: (id: string) => void;
  setActiveDashboard: (id: string) => void;
  updateDashboardSettings: (id: string, settings: Partial<DashboardSettings>) => void;
  addWidget: (dashboardId: string, type: WidgetType) => void;
  removeWidget: (dashboardId: string, widgetId: string) => void;
  updateWidgetConfig: (dashboardId: string, widgetId: string, config: Partial<WidgetConfig>) => void;
  updateLayouts: (dashboardId: string, layouts: WidgetLayout[]) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

// Provider
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const activeDashboard = state.dashboards.find((d) => d.id === state.activeDashboardId) || null;

  const createDashboard = useCallback((name: string) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'CREATE_DASHBOARD', payload: { id, name } });
    return id;
  }, []);

  const deleteDashboard = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DASHBOARD', payload: { id } });
  }, []);

  const setActiveDashboard = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_DASHBOARD', payload: { id } });
  }, []);

  const updateDashboardSettings = useCallback((id: string, settings: Partial<DashboardSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { id, settings } });
  }, []);

  const addWidget = useCallback((dashboardId: string, type: WidgetType) => {
    const dashboard = state.dashboards.find((d) => d.id === dashboardId);
    const existingLayouts = dashboard?.widgets.map((w) => w.layout) ?? [];
    const gridCols = dashboard?.settings.gridCols ?? 24;
    const gridRows = dashboard?.settings.gridRows ?? 16;

    const widget = createWidgetInstance(type, {
      existingLayouts,
      gridCols,
      gridRows,
    });
    dispatch({ type: 'ADD_WIDGET', payload: { dashboardId, widget } });
  }, [state.dashboards]);

  const removeWidget = useCallback((dashboardId: string, widgetId: string) => {
    dispatch({ type: 'REMOVE_WIDGET', payload: { dashboardId, widgetId } });
  }, []);

  const updateWidgetConfig = useCallback(
    (dashboardId: string, widgetId: string, config: Partial<WidgetConfig>) => {
      dispatch({ type: 'UPDATE_WIDGET_CONFIG', payload: { dashboardId, widgetId, config } });
    },
    []
  );

  const updateLayouts = useCallback((dashboardId: string, layouts: WidgetLayout[]) => {
    dispatch({ type: 'UPDATE_LAYOUTS', payload: { dashboardId, layouts } });
  }, []);

  const value: DashboardContextValue = {
    state,
    activeDashboard,
    createDashboard,
    deleteDashboard,
    setActiveDashboard,
    updateDashboardSettings,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    updateLayouts,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

// Hook
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
