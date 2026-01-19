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
  queryOverride?: string;      // Custom search query (overrides location name)
  useLocationQuery?: boolean;  // Auto-add location name to query (default: true)
  radiusKm?: number;           // Override default 50km radius
}

/**
 * Location context passed to widgets opened from pins
 */
export interface LocationContext {
  pinId: string;
  coordinates: [number, number];
  label: string;
  radius?: number; // km
  // Fields from reverse geocoding:
  locationName?: string;  // City or country name (for search queries)
  country?: string;       // Country name
  queryOverride?: string; // User's custom query for this widget
}
