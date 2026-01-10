'use client';

import { useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { BLUESKY_CONFIG, BLUESKY_POLL_INTERVAL_OPTIONS } from '../../constants';
import type { BlueskyFeedWidgetConfig } from './BlueskyFeedWidget.types';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  config: BlueskyFeedWidgetConfig;
  onConfigChange: (config: Partial<BlueskyFeedWidgetConfig>) => void;
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
      className="absolute top-full right-0 mt-1 z-50 bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg p-3 min-w-[200px]"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-muted)]">
            Max Posts
          </label>
          <select
            value={config.maxResults}
            onChange={(e) => onConfigChange({ maxResults: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          >
            {BLUESKY_CONFIG.maxResultsOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-muted)]">
            Refresh Interval
          </label>
          <select
            value={config.pollIntervalMs}
            onChange={(e) =>
              onConfigChange({ pollIntervalMs: Number(e.target.value) })
            }
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          >
            {BLUESKY_POLL_INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-border)]">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={config.showMedia}
              onChange={(e) => onConfigChange({ showMedia: e.target.checked })}
              className="w-4 h-4"
            />
            Show media
          </label>
        </div>
      </div>
    </div>
  );
}
