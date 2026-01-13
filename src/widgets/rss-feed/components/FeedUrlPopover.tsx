'use client';

import { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import type { RssFeedWidgetConfig } from '../types';

interface FeedUrlPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  config: RssFeedWidgetConfig;
  onConfigChange: (config: Partial<RssFeedWidgetConfig>) => void;
}

export function FeedUrlPopover({
  isOpen,
  onClose,
  config,
  onConfigChange,
}: FeedUrlPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedUrl, setFeedUrl] = useState(config.feedUrl);

  useClickOutside(popoverRef, isOpen, onClose);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Sync with config when it changes externally
  useEffect(() => {
    setFeedUrl(config.feedUrl);
  }, [config.feedUrl]);

  const handleSubmit = () => {
    onConfigChange({ feedUrl: feedUrl.trim() });
    onClose();
  };

  const handleClear = () => {
    setFeedUrl('');
    onConfigChange({ feedUrl: '' });
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
      className="absolute top-full left-0 right-0 mx-2 mt-1 z-50 bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg p-3"
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[var(--color-muted)]">
          Feed URL
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com/feed.xml"
            className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Load
          </button>
        </div>
        {config.feedUrl && (
          <button
            onClick={handleClear}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-destructive)] self-start"
          >
            Clear feed
          </button>
        )}
      </div>
    </div>
  );
}
