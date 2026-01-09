/** GDELT DOC API article response */
export interface GdeltDocArticle {
  url: string;
  url_mobile: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

/** GDELT DOC API response wrapper */
export interface GdeltDocResponse {
  articles: GdeltDocArticle[];
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
