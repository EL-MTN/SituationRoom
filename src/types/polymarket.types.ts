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
