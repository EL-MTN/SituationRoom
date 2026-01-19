/**
 * Map pin that can be linked to widgets
 */
export interface MapPin {
  id: string;
  coordinates: [number, number]; // [lat, lng]
  label: string;
  color?: string;
  linkedWidgetConfigs: LinkedWidgetConfig[];
}

/**
 * Configuration for a widget linked to a pin
 */
export interface LinkedWidgetConfig {
  widgetType: string;
  configOverrides?: Record<string, unknown>;
}

/**
 * Location context passed to widgets opened from pins
 */
export interface LocationContext {
  pinId: string;
  coordinates: [number, number];
  label: string;
  radius?: number; // km
}
