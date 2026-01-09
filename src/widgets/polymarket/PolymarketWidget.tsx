'use client'

import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { usePolymarketEvent, usePolymarketPriceHistory } from '../../hooks';
import type { WidgetProps } from '../registry';
import type { PolymarketWidgetConfig } from './PolymarketWidget.types';
import type { PolymarketMarket } from '../../types';
import { PriceHistoryChart } from './PriceHistoryChart';

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(0)}K`;
  return `$${volume.toFixed(0)}`;
}

function formatPercent(price: number): string {
  return `${(price * 100).toFixed(1)}%`;
}

interface OddsBarProps {
  outcome: string;
  price: number;
  isYes: boolean;
}

function OddsBar({ outcome, price, isYes }: OddsBarProps) {
  const percent = price * 100;
  const bgColor = isYes ? 'bg-emerald-500' : 'bg-rose-500';
  const textColor = isYes ? 'text-emerald-600' : 'text-rose-600';

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">{outcome}</span>
        <span className={`font-bold ${textColor}`}>{formatPercent(price)}</span>
      </div>
      <div className="h-3 bg-[var(--color-accent)] rounded-full overflow-hidden">
        <div
          className={`h-full ${bgColor} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface MarketCardProps {
  market: PolymarketMarket;
  priceHistory?: { timestamp: number; price: number }[];
  isLoadingHistory?: boolean;
}

function MarketCard({ market, priceHistory = [], isLoadingHistory }: MarketCardProps) {
  // Parse outcomes/prices - they may come as JSON strings
  const rawOutcomes = market.outcomes;
  const rawPrices = market.outcomePrices;

  const outcomes: string[] = typeof rawOutcomes === 'string'
    ? JSON.parse(rawOutcomes)
    : rawOutcomes || ['Yes', 'No'];

  const parsedPrices = typeof rawPrices === 'string'
    ? JSON.parse(rawPrices)
    : rawPrices || ['0.5', '0.5'];

  const prices = parsedPrices.map((p: string | number) =>
    typeof p === 'string' ? parseFloat(p) : p
  );

  const volume24h = market.volume24hr || 0;
  const priceChange = prices[0] - 0.5; // Simple change indicator

  return (
    <div className="px-2 py-3 space-y-3">
      {/* Market Question */}
      <h3 className="text-sm font-medium leading-tight">
        {market.question}
      </h3>

      {/* Odds Bars */}
      <div className="space-y-3">
        {outcomes.map((outcome, idx) => (
          <OddsBar
            key={outcome}
            outcome={outcome}
            price={prices[idx] || 0}
            isYes={idx === 0}
          />
        ))}
      </div>

      {/* Price History Chart */}
      <div className="pt-3 border-t border-[var(--color-border)]">
        {isLoadingHistory ? (
          <div className="h-[120px] flex items-center justify-center text-xs text-[var(--color-muted)]">
            Loading chart...
          </div>
        ) : (
          <PriceHistoryChart data={priceHistory} height={120} />
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)]">
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          <span>Vol 24h: {formatVolume(volume24h)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          <span>Liq: {formatVolume(market.liquidityNum || 0)}</span>
        </div>
        <div className="flex items-center gap-1">
          {priceChange >= 0 ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-rose-500" />
          )}
          <span className={priceChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
            {priceChange >= 0 ? '+' : ''}{(priceChange * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function PolymarketWidget({ config }: WidgetProps<PolymarketWidgetConfig>) {
  const { data: event, isLoading, error } = usePolymarketEvent({
    slug: config.eventSlug,
    enabled: !!config.eventSlug,
  });

  // Get the primary market's CLOB token ID for price history (first token = Yes outcome)
  const primaryMarket = event?.markets?.[0];
  const rawTokenIds = primaryMarket?.clobTokenIds;
  const tokenIds = typeof rawTokenIds === 'string' ? JSON.parse(rawTokenIds) : rawTokenIds;
  const yesTokenId = tokenIds?.[0] || null;

  const { data: priceHistory = [], isLoading: isLoadingHistory } = usePolymarketPriceHistory({
    marketId: yesTokenId,
    interval: config.chartInterval || '1d',
    enabled: !!yesTokenId,
  });

  // No market selected
  if (!config.eventSlug) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[var(--color-muted)] p-4">
        <Activity className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm text-center">
          No market selected.<br />
          Click the search icon to find a market.
        </p>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-muted)]">Loading...</div>
      </div>
    );
  }

  // Error
  if (error || !event) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--color-muted)] p-4">
        <p className="text-sm text-center">
          Failed to load market data.<br />
          The market may have been removed.
        </p>
      </div>
    );
  }

  if (!primaryMarket) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--color-muted)]">
        <p className="text-sm">No market data available</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <MarketCard
        market={primaryMarket}
        priceHistory={priceHistory}
        isLoadingHistory={isLoadingHistory}
      />
    </div>
  );
}
