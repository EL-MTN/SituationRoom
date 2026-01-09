import { useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import type { EventFeedWidgetConfig, WidgetConfig } from '../types';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  config: EventFeedWidgetConfig;
  onConfigChange: (config: Partial<WidgetConfig>) => void;
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
      className="absolute top-full right-0 mt-1 z-50 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg p-3 min-w-[180px]"
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[var(--color-muted)]">
          Time Range
        </label>
        <select
          value={config.filters.timespan || '24h'}
          onChange={(e) => {
            onConfigChange({
              filters: { ...config.filters, timespan: e.target.value },
            } as Partial<WidgetConfig>);
          }}
          className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        >
          <option value="15min">15 minutes</option>
          <option value="30min">30 minutes</option>
          <option value="1h">1 hour</option>
          <option value="3h">3 hours</option>
          <option value="6h">6 hours</option>
          <option value="12h">12 hours</option>
          <option value="24h">24 hours</option>
          <option value="3d">3 days</option>
          <option value="7d">7 days</option>
        </select>
      </div>
    </div>
  );
}
