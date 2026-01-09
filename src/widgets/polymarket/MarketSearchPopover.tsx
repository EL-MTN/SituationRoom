import { useState, useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { usePolymarketSearch } from '../../hooks';
import type { PolymarketSearchResult } from '../../types';

interface MarketSearchPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onMarketSelect: (slug: string, title: string) => void;
  selectedMarketTitle: string | null;
  onReset: () => void;
}

function formatPercent(price: string): string {
  return `${(parseFloat(price) * 100).toFixed(0)}%`;
}

export function MarketSearchPopover({
  isOpen,
  onClose,
  buttonRef,
  onMarketSelect,
  selectedMarketTitle,
  onReset,
}: MarketSearchPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Debounce the query by 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isLoading } = usePolymarketSearch({
    query: debouncedQuery,
    enabled: debouncedQuery.trim().length >= 2,
  });

  useClickOutside(popoverRef, isOpen, onClose);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Update position when popover opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 320),
      });
    }
  }, [isOpen, buttonRef]);

  const handleSelect = (result: PolymarketSearchResult) => {
    onMarketSelect(result.id, result.question || result.title);
    setQuery('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleReset = () => {
    onReset();
    setQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={popoverRef}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
      }}
      className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg p-3"
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[var(--color-muted)]">
          Search Markets
        </label>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Trump, Bitcoin, Fed rate"
          className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        />

        {(isLoading || (query !== debouncedQuery && query.trim().length >= 2)) && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--color-muted)]" />
          </div>
        )}

        {!isLoading && query === debouncedQuery && results.length > 0 && (
          <div className="mt-1 max-h-[250px] overflow-y-auto border border-[var(--color-border)] rounded">
            {results.map((result) => {
              const yesPrice = result.outcomePrices?.[0] || '0.5';
              return (
                <button
                  type="button"
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-accent)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
                >
                  <div className="font-medium truncate pr-12 relative">
                    {result.question || result.title}
                    <span className="absolute right-0 top-0 text-emerald-600 font-bold">
                      {formatPercent(yesPrice)}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">
                    Volume: ${(result.volume / 1000).toFixed(0)}K
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!isLoading && query === debouncedQuery && debouncedQuery.length >= 2 && results.length === 0 && (
          <div className="py-4 text-center text-sm text-[var(--color-muted)]">
            No markets found
          </div>
        )}

        {selectedMarketTitle && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-destructive)] self-start"
          >
            Clear selection
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
