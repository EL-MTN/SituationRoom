/** Default polling interval in milliseconds (5 minutes) */
export const DEFAULT_POLL_INTERVAL_MS = 300000;

/** Minimum polling interval in milliseconds (1 minute) */
export const MIN_POLL_INTERVAL_MS = 60000;

/** Default maximum items to display */
export const DEFAULT_MAX_ITEMS = 50;

/** Polling interval options for settings dropdown */
export const POLL_INTERVAL_OPTIONS = [
  { label: '1 minute', value: 60000 },
  { label: '5 minutes', value: 300000 },
  { label: '15 minutes', value: 900000 },
  { label: '30 minutes', value: 1800000 },
] as const;

/** RSS feed configuration */
export const RSS_FEED_CONFIG = {
  defaultPollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
  minPollIntervalMs: MIN_POLL_INTERVAL_MS,
  defaultMaxItems: DEFAULT_MAX_ITEMS,
  maxMaxItems: 100,
  minMaxItems: 10,
} as const;
