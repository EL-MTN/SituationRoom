import type { Dashboard, DashboardSettings } from '../types';

const STORAGE_KEY = 'situation-dashboard-state';
const STORAGE_VERSION = 1;

interface StoredState {
  version: number;
  dashboards: StoredDashboard[];
  activeDashboardId: string | null;
}

interface StoredDashboard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  widgets: Dashboard['widgets'];
  settings: DashboardSettings;
}

export interface DashboardState {
  dashboards: Dashboard[];
  activeDashboardId: string | null;
}

function serializeState(state: DashboardState): StoredState {
  return {
    version: STORAGE_VERSION,
    dashboards: state.dashboards.map((d) => ({
      id: d.id,
      name: d.name,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      widgets: d.widgets,
      settings: d.settings,
    })),
    activeDashboardId: state.activeDashboardId,
  };
}

function deserializeState(stored: StoredState): DashboardState {
  return {
    dashboards: stored.dashboards.map((d) => ({
      id: d.id,
      name: d.name,
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
      widgets: d.widgets,
      settings: d.settings,
    })),
    activeDashboardId: stored.activeDashboardId,
  };
}

export function saveDashboardState(state: DashboardState): void {
  try {
    const serialized = serializeState(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save dashboard state to localStorage:', error);
  }
}

export function loadDashboardState(): DashboardState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed: StoredState = JSON.parse(stored);

    // Version check for future migrations
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Dashboard state version mismatch, using defaults');
      return null;
    }

    return deserializeState(parsed);
  } catch (error) {
    console.error('Failed to load dashboard state from localStorage:', error);
    return null;
  }
}

export function clearDashboardState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear dashboard state from localStorage:', error);
  }
}
