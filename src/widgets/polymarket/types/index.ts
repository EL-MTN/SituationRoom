import type { BaseWidgetConfig } from '../../registry';

/** Price history interval options */
export type PriceHistoryInterval = '1m' | '1h' | '6h' | '1d' | '1w';

/** Polymarket widget configuration */
export interface PolymarketWidgetConfig extends BaseWidgetConfig {
  type: 'polymarket';
  /** Event slug to display (e.g., "will-trump-win-2024") */
  eventSlug: string | null;
  /** Display name of the selected market */
  eventTitle: string | null;
  /** Price history chart interval */
  chartInterval: PriceHistoryInterval;
}

/** Polymarket market outcome */
export interface PolymarketOutcome {
  name: string;
  price: number; // 0-1, represents probability
}

/** Polymarket market data */
export interface PolymarketMarket {
  id: string;
  conditionId: string;
  slug: string;
  question: string;
  // These can be JSON strings or arrays depending on the endpoint
  outcomes: string | string[];
  outcomePrices: string | string[];
  // CLOB token IDs for Yes/No outcomes - used for price history
  clobTokenIds?: string | string[];
  volume: string;
  volume24hr: number;
  liquidity: string;
  liquidityNum: number;
  active: boolean;
  closed: boolean;
  bestBid: number;
  bestAsk: number;
  lastTradePrice: number;
  spreadPercent?: number;
}

/** Polymarket event (contains multiple markets) */
export interface PolymarketEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  icon: string;
  volume: number;
  liquidity: number;
  markets: PolymarketMarket[];
  tags: PolymarketTag[];
  closed: boolean;
  // These fields are included directly in public-search results
  outcomes?: string | string[];
  outcomePrices?: string | string[];
}

/** Polymarket tag/category */
export interface PolymarketTag {
  id: string;
  slug: string;
  label: string;
}

/** Price history point */
export interface PolymarketPricePoint {
  timestamp: number;
  price: number;
}

/** Events API response */
export interface PolymarketEventsResponse {
  data: PolymarketEvent[];
  next_cursor?: string;
}

/** Search result for market selection */
export interface PolymarketSearchResult {
  id: string;
  slug: string;
  title: string;
  question: string;
  image?: string;
  volume: number;
  outcomes: string[];
  outcomePrices: string[];
}
