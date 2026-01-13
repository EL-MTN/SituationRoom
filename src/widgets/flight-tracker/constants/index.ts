export const FLIGHT_TRACKER_CONFIG = {
  defaults: {
    pollIntervalMs: 15000,
    showTrail: true,
    autoCenter: true,
    zoom: 6,
  },
  minPollIntervalMs: 10000,
  maxTrailLength: 50,
} as const;

export const FLIGHT_TRACKER_POLL_INTERVAL_OPTIONS = [
  { value: 10000, label: '10 seconds' },
  { value: 15000, label: '15 seconds' },
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
] as const;
