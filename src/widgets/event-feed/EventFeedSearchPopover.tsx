import { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { EventFeedWidgetConfig } from './EventFeedWidget.types';

interface EventFeedSearchPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  config: EventFeedWidgetConfig;
  onConfigChange: (config: Partial<EventFeedWidgetConfig>) => void;
}

export function EventFeedSearchPopover({
  isOpen,
  onClose,
  config,
  onConfigChange,
}: EventFeedSearchPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(config.filters.query || '');

  useClickOutside(popoverRef, isOpen, onClose);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Sync query with config when it changes externally
  useEffect(() => {
    setQuery(config.filters.query || '');
  }, [config.filters.query]);

  const handleSubmit = () => {
    onConfigChange({
      filters: { ...config.filters, query },
    });
    onClose();
  };

  const handleClear = () => {
    setQuery('');
    onConfigChange({
      filters: { ...config.filters, query: '' },
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute top-full left-0 right-0 mx-2 mt-1 z-50 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg p-3"
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[var(--color-muted)]">
          Search Query
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., ukraine, climate, elections"
            className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Search
          </button>
        </div>
        {config.filters.query && (
          <button
            onClick={handleClear}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-destructive)] self-start"
          >
            Clear search
          </button>
        )}
      </div>
    </div>
  );
}
