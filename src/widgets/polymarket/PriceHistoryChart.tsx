'use client'

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PolymarketPricePoint } from '../../types';

interface PriceHistoryChartProps {
  data: PolymarketPricePoint[];
  height?: number;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function PriceHistoryChart({ data, height = 120 }: PriceHistoryChartProps) {
  const chartData = useMemo(() => {
    if (data.length < 2) return null;

    const prices = data.map((d) => d.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const trend = lastPrice >= firstPrice ? 'up' : 'down';
    const priceChange = lastPrice - firstPrice;

    return {
      points: data.map((point) => ({
        timestamp: point.timestamp,
        price: point.price,
        date: formatDate(point.timestamp),
      })),
      trend,
      priceChange,
      currentPrice: lastPrice,
    };
  }, [data]);

  if (!chartData) {
    return (
      <div
        className="flex items-center justify-center text-xs text-(--color-muted)"
        style={{ height }}
      >
        No price history available
      </div>
    );
  }

  const { points, trend, priceChange, currentPrice } = chartData;
  const strokeColor = trend === 'up' ? '#10b981' : '#ef4444';

  return (
    <div className="w-full" style={{ height }}>
      {/* Header with current price and change */}
      <div className="flex justify-between items-center text-xs mb-2 px-1">
        <span className="text-(--color-muted)">Yes Price</span>
        <div className="flex items-center gap-2">
          <span className="font-bold">{formatPercent(currentPrice)}</span>
          <span className={trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}>
            {priceChange >= 0 ? '+' : ''}
            {(priceChange * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height - 28}>
        <AreaChart data={points} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            domain={['dataMin - 0.05', 'dataMax + 0.05']}
            tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value) => [formatPercent(value as number), 'Yes']}
            labelFormatter={(label) => String(label)}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: strokeColor }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
