export const GDELT_CONFIG = {
  baseUrl: 'https://api.gdeltproject.org/api/v2',
  docEndpoint: '/doc/doc',
  geoEndpoint: '/geo/geo',

  defaults: {
    timespan: '24h',
    maxRecords: 100,
    format: 'json',
    sort: 'datedesc',
  },

  geo: {
    defaultQuery: 'conflict OR violence OR attack OR military',
    defaultTimespan: '24h',
    pollIntervalMs: 900000, // 15 minutes - GEO updates every 15 min
  },

  // Rate limiting - be conservative
  minPollIntervalMs: 30000,
  defaultPollIntervalMs: 60000,
} as const;

export const TIMESPAN_OPTIONS = [
  { value: '15min', label: '15 minutes' },
  { value: '30min', label: '30 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '3h', label: '3 hours' },
  { value: '6h', label: '6 hours' },
  { value: '12h', label: '12 hours' },
  { value: '24h', label: '24 hours' },
  { value: '3d', label: '3 days' },
  { value: '7d', label: '7 days' },
] as const;
