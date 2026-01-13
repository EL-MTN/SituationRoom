'use client';

import { useRef } from 'react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import type { RssFeedWidgetConfig } from '../types';
import { POLL_INTERVAL_OPTIONS, RSS_FEED_CONFIG } from '../constants';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  config: RssFeedWidgetConfig;
  onConfigChange: (config: Partial<RssFeedWidgetConfig>) => void;
}

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
      className="absolute top-full right-0 mt-1 z-50 w-56 bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg p-3"
    >
      <div className="flex flex-col gap-3">
        {/* Poll Interval */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5">
            Refresh Interval
          </label>
          <select
            value={config.pollIntervalMs}
            onChange={(e) => onConfigChange({ pollIntervalMs: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-sm bg-[var(--color-background)] border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          >
            {POLL_INTERVAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Max Items */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5">
            Max Items: {config.maxItems}
          </label>
          <input
            type="range"
            min={RSS_FEED_CONFIG.minMaxItems}
            max={RSS_FEED_CONFIG.maxMaxItems}
            step={10}
            value={config.maxItems}
            onChange={(e) => onConfigChange({ maxItems: Number(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-muted)]">
            <span>{RSS_FEED_CONFIG.minMaxItems}</span>
            <span>{RSS_FEED_CONFIG.maxMaxItems}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
