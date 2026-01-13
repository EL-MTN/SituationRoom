import type { BaseWidgetConfig } from '../../registry';

/** Map-specific configuration */
export interface MapWidgetConfig extends BaseWidgetConfig {
  type: 'map';
  center: [number, number];
  zoom: number;
  showConflicts?: boolean;
  locationName?: string | null;
}

/** GDELT GEO API feature properties */
export interface GdeltGeoProperties {
  name: string;
  count: number;
  shareimage?: string;
  html?: string;
}

/** GDELT GEO API feature */
export interface GdeltGeoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: GdeltGeoProperties;
}

/** GDELT GEO API response (GeoJSON FeatureCollection) */
export interface GdeltGeoResponse {
  type: 'FeatureCollection';
  features: GdeltGeoFeature[];
}
