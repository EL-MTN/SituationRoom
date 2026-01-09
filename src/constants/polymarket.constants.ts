export const POLYMARKET_CONFIG = {
  // Use proxy paths to avoid CORS issues in development
  baseUrl: '/api/polymarket',
  // CLOB API has CORS enabled, use directly
  clobUrl: 'https://clob.polymarket.com',

  endpoints: {
    events: '/events',
    markets: '/markets',
    publicSearch: '/public-search',
  },

  defaults: {
    limit: 20,
  },

  // Polling interval for live odds updates
  pollIntervalMs: 30000, // 30 seconds
} as const;
