import type { WidgetInstance, WidgetLayout } from './widget.types';

/** Dashboard-level settings */
export interface DashboardSettings {
  defaultPollIntervalMs: number;
  theme: 'light' | 'dark' | 'system';
  gridCols: number;
  gridRows: number;
  showGridLines: boolean;
}

/** Complete dashboard configuration */
export interface Dashboard {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  widgets: WidgetInstance[];
  settings: DashboardSettings;
}

/** Layout change event from react-grid-layout */
export interface LayoutChangeEvent {
  layouts: WidgetLayout[];
}
