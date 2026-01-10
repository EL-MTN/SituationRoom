'use client';

import { useState, useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import { YOUTUBE_PRESETS } from './YoutubeWidget.types';

interface VideoSelectPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  videoUrl: string;
  onVideoChange: (url: string) => void;
}

export function VideoSelectPopover({
  isOpen,
  onClose,
  buttonRef,
  videoUrl,
  onVideoChange,
}: VideoSelectPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [localUrl, setLocalUrl] = useState(videoUrl);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useClickOutside(popoverRef, isOpen, onClose);

  useEffect(() => {
    setLocalUrl(videoUrl);
  }, [videoUrl]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVideoChange(localUrl);
    onClose();
  };

  const handlePresetClick = (url: string) => {
    onVideoChange(url);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClear = () => {
    setLocalUrl('');
    onVideoChange('');
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
      <div className="flex flex-col gap-3">
        <div className="text-xs font-medium text-[var(--color-muted)]">Presets</div>
        <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto">
          {YOUTUBE_PRESETS.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => handlePresetClick(preset.url)}
              className="text-left px-2 py-1.5 text-xs hover:bg-[var(--color-accent)] transition-colors truncate"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="border-t border-[var(--color-border)] pt-3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--color-muted)]">
              Custom URL
            </label>
            <input
              ref={inputRef}
              type="text"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white hover:opacity-90"
              >
                Load
              </button>
              {videoUrl && (
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
        </div>
      </div>
    </div>,
    document.body
  );
}
