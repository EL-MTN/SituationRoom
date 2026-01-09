import { GDELT_CONFIG } from '../../constants';
import type { GdeltDocResponse, GdeltGeoResponse, WidgetFilters } from '../../types';

function buildQueryString(filters: WidgetFilters): string {
  const parts: string[] = [];

  if (filters.query) {
    parts.push(filters.query);
  }

  if (filters.sourceLang) {
    parts.push(`sourcelang:${filters.sourceLang}`);
  }

  if (filters.sourceCountry) {
    parts.push(`sourcecountry:${filters.sourceCountry}`);
  }

  if (filters.toneMin !== undefined) {
    parts.push(`tone>${filters.toneMin}`);
  }

  if (filters.toneMax !== undefined) {
    parts.push(`tone<${filters.toneMax}`);
  }

  return parts.join(' ') || '*';
}

export interface FetchGeoParams {
  filters: WidgetFilters;
  timespan?: string;
  maxPoints?: number;
}

export async function fetchGdeltGeo({
  filters,
  timespan = GDELT_CONFIG.defaults.timespan,
  maxPoints = GDELT_CONFIG.defaults.maxPoints,
}: FetchGeoParams): Promise<GdeltGeoResponse> {
  const query = buildQueryString(filters);
  const params = new URLSearchParams({
    query,
    mode: 'pointdata',
    format: 'geojson',
    timespan,
    maxpoints: maxPoints.toString(),
  });

  const url = `${GDELT_CONFIG.baseUrl}${GDELT_CONFIG.geoEndpoint}?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GDELT GEO API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data as GdeltGeoResponse;
}

export interface FetchDocParams {
  filters: WidgetFilters;
  timespan?: string;
  maxRecords?: number;
}

export async function fetchGdeltDoc({
  filters,
  timespan = GDELT_CONFIG.defaults.timespan,
  maxRecords = GDELT_CONFIG.defaults.maxRecords,
}: FetchDocParams): Promise<GdeltDocResponse> {
  const query = buildQueryString(filters);
  const params = new URLSearchParams({
    query,
    mode: 'artlist',
    format: 'json',
    timespan,
    maxrecords: maxRecords.toString(),
    sort: GDELT_CONFIG.defaults.sort,
  });

  const url = `${GDELT_CONFIG.baseUrl}${GDELT_CONFIG.docEndpoint}?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GDELT DOC API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data as GdeltDocResponse;
}
