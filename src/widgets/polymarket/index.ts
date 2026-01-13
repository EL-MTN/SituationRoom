import { TrendingUp } from 'lucide-react';
import { WidgetRegistry } from '../registry';
import { PolymarketWidget } from './PolymarketWidget';
import { PolymarketWidgetHeader } from './PolymarketWidgetHeader';
import { PolymarketWidgetToolbar } from './PolymarketWidgetToolbar';
import type { PolymarketWidgetConfig } from './types';

// Self-register on import
WidgetRegistry.register<PolymarketWidgetConfig>({
  metadata: {
    type: 'polymarket',
    displayName: 'Polymarket',
    description: 'Prediction market odds from Polymarket',
    icon: TrendingUp,
  },
  defaults: {
    config: {
      type: 'polymarket',
      title: 'Polymarket',
      eventSlug: null,
      eventTitle: null,
      chartInterval: '1h',
    },
    layout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  component: PolymarketWidget,
  headerActions: PolymarketWidgetHeader,
  toolbarItems: PolymarketWidgetToolbar,
});

// Re-export for direct usage if needed
export { PolymarketWidget } from './PolymarketWidget';
export { PolymarketWidgetHeader } from './PolymarketWidgetHeader';
export { MarketSearchPopover } from './components';
export type { PolymarketWidgetConfig, PriceHistoryInterval } from './types';
