import type { BaseWidgetConfig } from '../registry';

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
