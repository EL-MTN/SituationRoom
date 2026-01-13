'use client';

import { useState, useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface SearchPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  query: string;
  onQueryChange: (query: string) => void;
}

export function SearchPopover({
  isOpen,
  onClose,
  buttonRef,
  query,
  onQueryChange,
}: SearchPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState(query);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useClickOutside(popoverRef, isOpen, onClose);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }
  }, [isOpen, buttonRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQueryChange(localQuery);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    onQueryChange('');
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
      className="bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg p-3"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[var(--color-muted)]">
          Search Query
        </label>
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., tech news, from:user.bsky.social"
          className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        />
        <p className="text-[10px] text-[var(--color-muted)]">
          Search posts on Bluesky
        </p>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white hover:opacity-90"
          >
            Search
          </button>
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-destructive)]"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>,
    document.body
  );
}
