'use client'

import { useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { PolymarketWidgetConfig, PriceHistoryInterval } from './PolymarketWidget.types';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  config: PolymarketWidgetConfig;
  onConfigChange: (config: Partial<PolymarketWidgetConfig>) => void;
}

const INTERVAL_OPTIONS: { value: PriceHistoryInterval; label: string }[] = [
  { value: '1m', label: '1 Month' },
  { value: '1w', label: '1 Week' },
  { value: '1d', label: '1 Day' },
  { value: '6h', label: '6 Hours' },
  { value: '1h', label: '1 Hour' },
];

export function SettingsPopover({
  isOpen,
  onClose,
  config,
  onConfigChange,
}: SettingsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useClickOutside(popoverRef, isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full right-0 mt-1 z-50 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg p-3 min-w-[180px]"
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[var(--color-muted)]">
          Chart Interval
        </label>
        <select
          value={config.chartInterval || '1d'}
          onChange={(e) => {
            onConfigChange({
              chartInterval: e.target.value as PriceHistoryInterval,
            });
          }}
          className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        >
          {INTERVAL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
