'use client'

import { useState } from 'react';
import { Search } from 'lucide-react';
import { EventFeedSearchPopover } from './EventFeedSearchPopover';
import type { WidgetHeaderExtensionProps } from '../registry';
import type { EventFeedWidgetConfig } from './EventFeedWidget.types';

export function EventFeedWidgetHeader({
  config,
  onConfigChange,
}: WidgetHeaderExtensionProps<EventFeedWidgetConfig>) {
  const [showSearchPopover, setShowSearchPopover] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowSearchPopover(!showSearchPopover)}
        onMouseDown={(e) => e.stopPropagation()}
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
          config.filters.query
            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
            : 'hover:bg-[var(--color-accent)] text-[var(--color-muted)]'
        }`}
        title="Search events"
      >
        <Search className="w-4 h-4" />
        {config.filters.query && (
          <span className="font-medium truncate max-w-[120px]">
            {config.filters.query}
          </span>
        )}
      </button>

      <EventFeedSearchPopover
        isOpen={showSearchPopover}
        onClose={() => setShowSearchPopover(false)}
        config={config}
        onConfigChange={onConfigChange}
      />
    </>
  );
}
