/** Geographic location mentioned in event */
export interface EventLocation {
  name: string;
  type: 'city' | 'admin1' | 'country' | 'unknown';
  lat: number;
  lng: number;
  countryCode?: string;
}

/** Normalized event from any data source */
export interface NormalizedEvent {
  id: string;
  title: string;
  url: string;
  urlMobile?: string;
  sourceUrl: string;
  sourceName: string;
  sourceCountry: string;
  language: string;
  publishedAt: Date;
  seenAt: Date;
  imageUrl?: string;
  tone?: number;
  locations: EventLocation[];
  themes?: string[];
  raw?: unknown;
}

/** Event with geo coordinates for map display */
export interface GeoEvent extends NormalizedEvent {
  coordinates: [number, number];
  allMentionedNames?: string;
}

/** Event selection for cross-widget communication */
export interface EventSelection {
  eventId: string | null;
  source: 'map' | 'event-feed' | null;
  timestamp: number;
}

/** Geographic focus for map coordination */
export interface GeoFocus {
  center: [number, number];
  zoom: number;
  source: string;
}
