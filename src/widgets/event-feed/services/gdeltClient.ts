import { GDELT_CONFIG } from '../constants';
import type { GdeltDocResponse, EventFeedFilters } from '../types';

function buildQueryString(filters: EventFeedFilters): string {
  if (filters.query) {
    return filters.query;
  }
  return '*';
}

export interface FetchDocParams {
  filters: EventFeedFilters;
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
