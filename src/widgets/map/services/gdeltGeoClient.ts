import { GDELT_GEO_CONFIG } from '../constants';
import type { GdeltGeoResponse } from '../types';

export interface FetchGeoParams {
  query?: string;
  timespan?: string;
}

export async function fetchGdeltGeo({
  query = GDELT_GEO_CONFIG.geo.defaultQuery,
  timespan = GDELT_GEO_CONFIG.geo.defaultTimespan,
}: FetchGeoParams = {}): Promise<GdeltGeoResponse> {
  const params = new URLSearchParams({
    query,
    format: 'geojson',
    timespan,
  });

  const url = `${GDELT_GEO_CONFIG.baseUrl}${GDELT_GEO_CONFIG.geoEndpoint}?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GDELT GEO API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data as GdeltGeoResponse;
}
