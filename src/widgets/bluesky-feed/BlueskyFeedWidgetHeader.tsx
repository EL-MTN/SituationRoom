'use client';

import { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { SearchPopover } from './components';
import type { WidgetHeaderExtensionProps } from '../registry';
import type { BlueskyFeedWidgetConfig } from './types';

export function BlueskyFeedWidgetHeader({
  config,
  onConfigChange,
}: WidgetHeaderExtensionProps<BlueskyFeedWidgetConfig>) {
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const displayQuery = config.query
    ? config.query.length > 25
      ? config.query.slice(0, 25) + '...'
      : config.query
    : 'Set query...';

  const hasQuery = Boolean(config.query);

  return (
    <>
      <button
        ref={searchButtonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowSearchPopover(!showSearchPopover);
        }}
        className={`flex items-center gap-1.5 px-2 py-1 text-sm transition-colors ${
          hasQuery
            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
            : 'hover:bg-[var(--color-accent)] text-[var(--color-muted)]'
        }`}
        title="Search posts"
      >
        <Search className="w-4 h-4" />
        <span className="font-medium truncate max-w-[200px]">{displayQuery}</span>
      </button>

      <SearchPopover
        isOpen={showSearchPopover}
        onClose={() => setShowSearchPopover(false)}
        buttonRef={searchButtonRef}
        query={config.query}
        onQueryChange={(query) => onConfigChange({ query })}
      />
    </>
  );
}
