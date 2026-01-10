export const BLUESKY_CONFIG = {
  defaults: {
    maxResults: 25,
    pollIntervalMs: 60000,
    showMedia: true,
  },

  minPollIntervalMs: 30000,
  maxResultsOptions: [10, 25, 50, 100] as const,
} as const;

export const BLUESKY_POLL_INTERVAL_OPTIONS = [
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 120000, label: '2 minutes' },
  { value: 300000, label: '5 minutes' },
] as const;
