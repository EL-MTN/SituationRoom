import LZString from 'lz-string';
import type { Dashboard, DashboardSettings, WidgetInstance, WidgetConfig, WidgetLayout } from '../types';
import type { MapWidgetConfig } from '../widgets/map/MapWidget.types';
import type { EventFeedWidgetConfig } from '../widgets/event-feed/EventFeedWidget.types';
import type { PolymarketWidgetConfig, PriceHistoryInterval } from '../widgets/polymarket/PolymarketWidget.types';
import type { BlueskyFeedWidgetConfig } from '../widgets/bluesky-feed/BlueskyFeedWidget.types';

// Schema version for future migrations
const SCHEMA_VERSION = 1;

// Type abbreviations for compact encoding
const TYPE_TO_SHORT: Record<string, string> = {
  'map': 'm',
  'event-feed': 'e',
  'polymarket': 'p',
  'bluesky-feed': 'b',
};

const SHORT_TO_TYPE: Record<string, string> = {
  'm': 'map',
  'e': 'event-feed',
  'p': 'polymarket',
  'b': 'bluesky-feed',
};

// Minimal state schema
interface MinimalState {
  v: number;
  t?: 'light' | 'dark'; // theme (omit if 'system')
  w: MinimalWidget[];
}

interface MinimalWidget {
  t: string; // type abbreviation
  l: [number, number, number, number]; // [x, y, w, h]
  c: Record<string, unknown>; // type-specific config
}

/**
 * Encode dashboard state to a URL-safe compressed string
 */
export function encodeShareableState(dashboard: Dashboard): string {
  const minimal = toMinimalState(dashboard);
  const json = JSON.stringify(minimal);
  return LZString.compressToEncodedURIComponent(json);
}

/**
 * Decode a compressed string back to dashboard state
 * Returns null if decoding fails
 */
export function decodeShareableState(encoded: string): DecodedDashboard | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) {
      console.warn('[urlState] Failed to decompress URL state');
      return null;
    }

    const minimal = JSON.parse(json) as MinimalState;
    if (!isValidMinimalState(minimal)) {
      console.warn('[urlState] Invalid URL state schema');
      return null;
    }

    return fromMinimalState(minimal);
  } catch (error) {
    console.warn('[urlState] Failed to decode URL state:', error);
    return null;
  }
}

/**
 * Generate a full shareable URL for the dashboard
 */
export function getShareableUrl(dashboard: Dashboard): string {
  const encoded = encodeShareableState(dashboard);
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  return `${baseUrl}?d=${encoded}`;
}

/**
 * Estimate the URL length for a dashboard
 */
export function estimateUrlLength(dashboard: Dashboard): number {
  const encoded = encodeShareableState(dashboard);
  const baseLength = typeof window !== 'undefined'
    ? window.location.origin.length + window.location.pathname.length
    : 50;
  return baseLength + 3 + encoded.length; // +3 for "?d="
}

// Decoded dashboard shape (partial, will be merged with defaults)
export interface DecodedDashboard {
  widgets: WidgetInstance[];
  settings: Partial<DashboardSettings>;
}

function toMinimalState(dashboard: Dashboard): MinimalState {
  const minimal: MinimalState = {
    v: SCHEMA_VERSION,
    w: dashboard.widgets.map(widgetToMinimal),
  };

  // Only include theme if not 'system' (the default)
  if (dashboard.settings.theme !== 'system') {
    minimal.t = dashboard.settings.theme;
  }

  return minimal;
}

function widgetToMinimal(widget: WidgetInstance): MinimalWidget {
  const { config, layout } = widget;
  const shortType = TYPE_TO_SHORT[config.type] || config.type;

  return {
    t: shortType,
    l: [layout.x, layout.y, layout.w, layout.h],
    c: configToMinimal(config),
  };
}

function configToMinimal(config: WidgetConfig): Record<string, unknown> {
  switch (config.type) {
    case 'map': {
      const mapConfig = config as MapWidgetConfig;
      const c: Record<string, unknown> = {
        c: mapConfig.center, // [lat, lng]
        z: mapConfig.zoom,
      };
      if (mapConfig.showConflicts !== undefined) c.s = mapConfig.showConflicts;
      if (mapConfig.locationName) c.n = mapConfig.locationName;
      return c;
    }

    case 'event-feed': {
      const feedConfig = config as EventFeedWidgetConfig;
      const c: Record<string, unknown> = {};
      if (feedConfig.filters.query) c.q = feedConfig.filters.query;
      if (feedConfig.filters.timespan && feedConfig.filters.timespan !== '24h') {
        c.ts = feedConfig.filters.timespan;
      }
      return c;
    }

    case 'polymarket': {
      const polyConfig = config as PolymarketWidgetConfig;
      const c: Record<string, unknown> = {};
      if (polyConfig.eventSlug) c.s = polyConfig.eventSlug;
      if (polyConfig.eventTitle) c.et = polyConfig.eventTitle;
      if (polyConfig.chartInterval && polyConfig.chartInterval !== '1d') {
        c.i = polyConfig.chartInterval;
      }
      return c;
    }

    case 'bluesky-feed': {
      const bskyConfig = config as BlueskyFeedWidgetConfig;
      const c: Record<string, unknown> = {};
      if (bskyConfig.query) c.q = bskyConfig.query;
      if (bskyConfig.maxResults !== 25) c.m = bskyConfig.maxResults;
      if (bskyConfig.pollIntervalMs !== 60000) c.p = bskyConfig.pollIntervalMs;
      if (!bskyConfig.showMedia) c.sm = false;
      return c;
    }

    default:
      return {};
  }
}

function fromMinimalState(minimal: MinimalState): DecodedDashboard {
  // Handle schema migrations
  if (minimal.v > SCHEMA_VERSION) {
    console.warn(`[urlState] URL state version ${minimal.v} is newer than supported ${SCHEMA_VERSION}`);
  }

  const widgets = minimal.w
    .map((w) => {
      const type = SHORT_TO_TYPE[w.t] || w.t;
      if (!type) {
        console.warn(`[urlState] Unknown widget type: ${w.t}, skipping`);
        return null;
      }
      return minimalToWidget(w, type);
    })
    .filter((w): w is WidgetInstance => w !== null);

  const settings: Partial<DashboardSettings> = {};
  if (minimal.t) {
    settings.theme = minimal.t;
  }

  return { widgets, settings };
}

function minimalToWidget(minimal: MinimalWidget, type: string): WidgetInstance {
  const [x, y, w, h] = minimal.l;
  const id = crypto.randomUUID();

  const layout: WidgetLayout = {
    i: id,
    x,
    y,
    w,
    h,
  };

  const config = minimalToConfig(minimal.c, type, id);

  return { config, layout };
}

function minimalToConfig(c: Record<string, unknown>, type: string, id: string): WidgetConfig {
  switch (type) {
    case 'map': {
      const config: MapWidgetConfig = {
        id,
        type: 'map',
        title: 'Map',
        center: (c.c as [number, number]) || [0, 0],
        zoom: (c.z as number) || 2,
      };
      if (c.s !== undefined) config.showConflicts = c.s as boolean;
      if (c.n) config.locationName = c.n as string;
      return config;
    }

    case 'event-feed': {
      const config: EventFeedWidgetConfig = {
        id,
        type: 'event-feed',
        title: 'Event Feed',
        pollIntervalMs: 60000,
        filters: {
          query: (c.q as string) || '',
          timespan: (c.ts as string) || '24h',
        },
        maxItems: 100,
        showImages: true,
        highlightKeywords: [],
      };
      return config;
    }

    case 'polymarket': {
      const config: PolymarketWidgetConfig = {
        id,
        type: 'polymarket',
        title: 'Polymarket',
        eventSlug: (c.s as string) || null,
        eventTitle: (c.et as string) || null,
        chartInterval: (c.i as PriceHistoryInterval) || '1d',
      };
      return config;
    }

    case 'bluesky-feed': {
      const config: BlueskyFeedWidgetConfig = {
        id,
        type: 'bluesky-feed',
        title: 'Bluesky Feed',
        query: (c.q as string) || '',
        maxResults: (c.m as number) || 25,
        pollIntervalMs: (c.p as number) || 60000,
        showMedia: c.sm !== false,
      };
      return config;
    }

    default:
      throw new Error(`Unknown widget type: ${type}`);
  }
}

function isValidMinimalState(obj: unknown): obj is MinimalState {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'v' in obj &&
    typeof (obj as MinimalState).v === 'number' &&
    'w' in obj &&
    Array.isArray((obj as MinimalState).w)
  );
}
