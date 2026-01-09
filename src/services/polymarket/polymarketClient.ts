import { POLYMARKET_CONFIG } from '../../constants';
import type {
  PolymarketEvent,
  PolymarketMarket,
  PolymarketSearchResult,
  PolymarketPricePoint,
} from '../../types';

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
  console.log('[Polymarket] Search URL:', url);

  const response = await fetch(url);
  console.log('[Polymarket] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Polymarket] Search error response:', errorText);
    throw new Error(`Polymarket search error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[Polymarket] Raw response data:', data);

  // The public-search endpoint returns { events: [...], pagination: {...} }
  const events = (data?.events || []) as PolymarketEvent[];
  console.log('[Polymarket] Events count:', events.length);

  const results = events.slice(0, 20).map((event) => {
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

  console.log('[Polymarket] Transformed results:', results);
  return results;
}

/** Fetch price history for a market from CLOB API */
export async function fetchPriceHistory(
  marketId: string,
  interval: 'hour' | 'day' | 'week' = 'day'
): Promise<PolymarketPricePoint[]> {
  // CLOB API endpoint for price history
  const url = `${clobUrl}/prices-history?market=${marketId}&interval=${interval}&fidelity=60`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Price history not available for market ${marketId}`);
      return [];
    }

    const data = await response.json();

    // Transform the response - CLOB returns { history: [{ t: timestamp, p: price }] }
    if (data.history && Array.isArray(data.history)) {
      return data.history.map((point: { t: number; p: number }) => ({
        timestamp: point.t * 1000, // Convert to milliseconds
        price: point.p,
      }));
    }

    return [];
  } catch (error) {
    console.warn('Failed to fetch price history:', error);
    return [];
  }
}
