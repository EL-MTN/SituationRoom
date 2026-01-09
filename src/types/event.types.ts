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
  sourceUrl: string;
  sourceName: string;
  sourceCountry: string;
  language: string;
  publishedAt: Date;
  seenAt: Date;
  imageUrl?: string;
  tone?: number;
  locations: EventLocation[];
  raw?: unknown;
}

/** Event selection for cross-widget communication */
export interface EventSelection {
  eventId: string | null;
  source: 'event-feed' | null;
  timestamp: number;
}
