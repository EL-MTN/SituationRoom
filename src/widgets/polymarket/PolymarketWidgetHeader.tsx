'use client'

import { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { MarketSearchPopover } from './MarketSearchPopover';
import type { WidgetHeaderExtensionProps } from '../registry';
import type { PolymarketWidgetConfig } from './PolymarketWidget.types';

export function PolymarketWidgetHeader({
  config,
  onConfigChange,
}: WidgetHeaderExtensionProps<PolymarketWidgetConfig>) {
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const selectedMarketTitle = config.eventTitle && typeof config.eventTitle === 'string'
    ? config.eventTitle
    : null;

  const handleMarketSelect = (slug: string, title: string) => {
    if (slug && title) {
      onConfigChange({ eventSlug: slug, eventTitle: title });
    }
  };

  const handleReset = () => {
    onConfigChange({ eventSlug: null, eventTitle: null });
  };

  const displayTitle = selectedMarketTitle
    ? (selectedMarketTitle.length > 30 ? selectedMarketTitle.slice(0, 30) + '...' : selectedMarketTitle)
    : 'Select market...';

  const hasSelection = Boolean(selectedMarketTitle);

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
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
          hasSelection
            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
            : 'hover:bg-[var(--color-accent)] text-[var(--color-muted)]'
        }`}
        title="Search markets"
      >
        <Search className="w-4 h-4" />
        <span className="font-medium truncate max-w-[200px]">
          {displayTitle}
        </span>
      </button>

      <MarketSearchPopover
        isOpen={showSearchPopover}
        onClose={() => setShowSearchPopover(false)}
        buttonRef={searchButtonRef}
        onMarketSelect={handleMarketSelect}
        selectedMarketTitle={selectedMarketTitle}
        onReset={handleReset}
      />
    </>
  );
}
