import { POLYMARKET_CONFIG } from '../constants';
import type {
  PolymarketEvent,
  PolymarketMarket,
  PolymarketSearchResult,
  PolymarketPricePoint,
} from '../types';

const { baseUrl, clobUrl, endpoints } = POLYMARKET_CONFIG;

/** Fetch trending/active events */
export async function fetchEvents(params?: {
  limit?: number;
  closed?: boolean;
  tag?: string;
}): Promise<PolymarketEvent[]> {
  const searchParams = new URLSearchParams({
    closed: String(params?.closed ?? false),
    limit: String(params?.limit ?? POLYMARKET_CONFIG.defaults.limit),
  });

  if (params?.tag) {
    searchParams.set('tag', params.tag);
  }

  const url = `${baseUrl}${endpoints.events}?${searchParams}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Polymarket API error: ${response.status}`);
  }

  const data = await response.json();
  return data as PolymarketEvent[];
}

/** Fetch a single event by slug or ID */
export async function fetchEvent(slugOrId: string): Promise<PolymarketEvent | null> {
  const url = `${baseUrl}${endpoints.events}/${slugOrId}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Polymarket API error: ${response.status}`);
  }

  return response.json();
}

/** Fetch a single market by ID */
export async function fetchMarket(marketId: string): Promise<PolymarketMarket | null> {
  const url = `${baseUrl}${endpoints.markets}/${marketId}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Polymarket API error: ${response.status}`);
  }

  return response.json();
}

/** Search for markets using the public search API */
export async function searchMarkets(query: string): Promise<PolymarketSearchResult[]> {
  if (!query.trim()) return [];

  const url = `${baseUrl}${endpoints.publicSearch}?q=${encodeURIComponent(query)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Polymarket search error: ${response.status}`);
  }

  const data = await response.json();

  // The public-search endpoint returns { events: [...], pagination: {...} }
  const events = (data?.events || []) as PolymarketEvent[];

  return events.slice(0, 20).map((event) => {
    const primaryMarket = event.markets?.[0];

    // Parse outcomes/prices - they come as JSON strings from search endpoint
    const rawOutcomes = primaryMarket?.outcomes || event.outcomes;
    const rawPrices = primaryMarket?.outcomePrices || event.outcomePrices;

    const outcomes = typeof rawOutcomes === 'string' ? JSON.parse(rawOutcomes) : rawOutcomes || ['Yes', 'No'];
    const outcomePrices = typeof rawPrices === 'string' ? JSON.parse(rawPrices) : rawPrices || ['0.5', '0.5'];

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      question: primaryMarket?.question || event.title,
      image: event.image,
      volume: event.volume || 0,
      outcomes,
      outcomePrices,
    };
  });
}

/** Fetch price history for a market from CLOB API */
export async function fetchPriceHistory(
  tokenId: string,
  interval: '1m' | '1h' | '6h' | '1d' | '1w' = '1d'
): Promise<PolymarketPricePoint[]> {
  // Fidelity: minutes between data points (lower = more granular)
  const fidelityMap: Record<string, number> = {
    '1h': 1,     // 1 min between points (~60 points)
    '6h': 5,     // 5 min between points (~72 points)
    '1d': 10,    // 10 min between points (~144 points)
    '1w': 5,     // 5 min between points
    '1m': 10,    // 10 min between points (1 month)
  };
  const fidelity = fidelityMap[interval] ?? 10;
  const url = `${clobUrl}/prices-history?market=${tokenId}&interval=${interval}&fidelity=${fidelity}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.history && Array.isArray(data.history)) {
      return data.history.map((point: { t: number; p: number }) => ({
        timestamp: point.t * 1000,
        price: point.p,
      }));
    }

    return [];
  } catch {
    return [];
  }
}
