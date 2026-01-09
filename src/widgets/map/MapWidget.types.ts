import type { BaseWidgetConfig } from '../registry';

/** Map-specific configuration */
export interface MapWidgetConfig extends BaseWidgetConfig {
  type: 'map';
  center: [number, number];
  zoom: number;
}
