import { useState } from 'react';
import { Settings, X, RefreshCw, GripVertical } from 'lucide-react';
import type { WidgetConfig } from '../types';

interface WidgetWrapperProps {
  config: WidgetConfig;
  onRemove: () => void;
  onConfigChange: (config: Partial<WidgetConfig>) => void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
  children: React.ReactNode;
}

export function WidgetWrapper({
  config,
  onRemove,
  onConfigChange,
  isLoading,
  lastUpdated,
  children,
}: WidgetWrapperProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="h-full flex flex-col bg-(--color-background) border border-(--color-border) rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border) bg-(--color-accent)/50">
        <div className="flex items-center gap-2">
          {/* Grip icon - only element that allows dragging */}
          <span className="cursor-grab">
            <GripVertical className="w-4 h-4 text-(--color-muted)" />
          </span>
          <span
            className="font-medium text-sm"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {config.title}
          </span>
          {isLoading && (
            <RefreshCw className="w-3 h-3 text-(--color-primary) animate-spin" />
          )}
        </div>
        <div
          className="flex items-center gap-1"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {lastUpdated && (
            <span className="text-xs text-(--color-muted) mr-2">
              {formatRelativeTime(lastUpdated)}
            </span>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 rounded hover:bg-(--color-accent) transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-(--color-muted)" />
          </button>
          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-[var(--color-destructive)]/10 transition-colors"
            title="Remove widget"
          >
            <X className="w-4 h-4 text-(--color-muted) hover:text-(--color-destructive)" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          className="px-3 py-2 border-b border-(--color-border) bg-(--color-accent)/30"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-(--color-muted) mb-1">
                Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => onConfigChange({ title: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-(--color-border) rounded bg-(--color-background)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-(--color-muted) mb-1">
                Search Query
              </label>
              <input
                type="text"
                value={config.filters.query || ''}
                onChange={(e) =>
                  onConfigChange({
                    filters: { ...config.filters, query: e.target.value },
                  } as Partial<WidgetConfig>)
                }
                placeholder="e.g., ukraine, climate, elections"
                className="w-full px-2 py-1 text-sm border border-(--color-border) rounded bg-(--color-background)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-(--color-muted) mb-1">
                Time Range
              </label>
              <select
                value={config.filters.timespan || '24h'}
                onChange={(e) =>
                  onConfigChange({
                    filters: { ...config.filters, timespan: e.target.value },
                  } as Partial<WidgetConfig>)
                }
                className="w-full px-2 py-1 text-sm border border-(--color-border) rounded bg-(--color-background)"
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
        </div>
      )}

      {/* Content */}
      <div
        className="flex-1 overflow-hidden min-h-0"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}
