import type { BaseWidgetConfig } from '../registry';

/** Polymarket widget configuration */
export interface PolymarketWidgetConfig extends BaseWidgetConfig {
  type: 'polymarket';
  /** Event slug to display (e.g., "will-trump-win-2024") */
  eventSlug: string | null;
  /** Display name of the selected market */
  eventTitle: string | null;
}
