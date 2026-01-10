'use client'

import { X, RefreshCw, GripVertical } from 'lucide-react';
import { WidgetRegistry } from '../registry';
import type { BaseWidgetConfig } from '../registry';
import { formatRelativeTime } from '../../utils/formatRelativeTime';

interface WidgetWrapperProps {
  config: BaseWidgetConfig;
  onRemove: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConfigChange: (config: any) => void;
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
  // Get widget definition from registry
  const definition = WidgetRegistry.get(config.type);

  // Get header actions and toolbar items from widget definition (if any)
  const HeaderActions = definition?.headerActions;
  const ToolbarItems = definition?.toolbarItems;

  return (
    <div className="h-full flex flex-col bg-(--color-background) border border-(--color-border) shadow-sm">
      {/* Header */}
      <div className="relative flex items-center justify-between px-3 py-2 border-b border-(--color-border) bg-(--color-accent)/50 overflow-visible z-20">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <span className="widget-drag-handle cursor-grab">
            <GripVertical className="w-4 h-4 text-(--color-muted)" />
          </span>

          {/* Widget-specific header actions (search, location, etc.) or title fallback */}
          {HeaderActions ? (
            <HeaderActions
              config={config}
              onConfigChange={onConfigChange}
            />
          ) : (
            <span
              className="font-medium text-sm"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {config.title}
            </span>
          )}

          {isLoading && (
            <RefreshCw className="w-3 h-3 text-(--color-primary) animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
          {lastUpdated && (
            <span className="text-xs text-(--color-muted) mr-2">
              {formatRelativeTime(lastUpdated)}
            </span>
          )}

          {/* Widget-specific toolbar items (settings, etc.) */}
          {ToolbarItems && (
            <ToolbarItems
              config={config}
              onConfigChange={onConfigChange}
            />
          )}

          <button
            onClick={onRemove}
            className="p-1 hover:bg-[var(--color-destructive)]/10 transition-colors"
            title="Remove widget"
          >
            <X className="w-4 h-4 text-(--color-muted) hover:text-(--color-destructive)" />
          </button>
        </div>
      </div>

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
