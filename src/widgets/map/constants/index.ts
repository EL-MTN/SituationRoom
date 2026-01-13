export const GDELT_GEO_CONFIG = {
  baseUrl: 'https://api.gdeltproject.org/api/v2',
  geoEndpoint: '/geo/geo',

  geo: {
    defaultQuery: 'conflict OR violence OR attack OR military',
    defaultTimespan: '24h',
    pollIntervalMs: 900000, // 15 minutes - GEO updates every 15 min
  },
} as const;
