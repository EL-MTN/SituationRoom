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

/** GDELT GEO API GeoJSON Feature */
export interface GdeltGeoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    name: string;
    url: string;
    urltitle: string;
    urlpubtimedate: string;
    urlsocialimage?: string;
    domain: string;
    language: string;
    sourcecountry: string;
    tone?: number;
    mentionednames?: string;
    allmentionednames?: string;
  };
}

/** GDELT GEO API response */
export interface GdeltGeoResponse {
  type: 'FeatureCollection';
  features: GdeltGeoFeature[];
}
