'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Trash2, Link2 } from 'lucide-react';
import type { MapPin } from '@/types/pin.types';

interface PinEditPopoverProps {
  pin?: MapPin | null;
  coordinates?: [number, number] | null;
  position: { x: number; y: number };
  onSave: (data: { label: string; color: string }) => void;
  onDelete?: () => void;
  onLinkWidgets?: () => void;
  onClose: () => void;
  isNew?: boolean;
}

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6b7280', // Gray
];

export function PinEditPopover({
  pin,
  coordinates,
  position,
  onSave,
  onDelete,
  onLinkWidgets,
  onClose,
  isNew = false,
}: PinEditPopoverProps) {
  const [label, setLabel] = useState(pin?.label ?? '');
  const [color, setColor] = useState(pin?.color ?? PRESET_COLORS[0]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Position the popover within viewport bounds
  const adjustedPosition = {
    x: typeof window !== 'undefined' ? Math.min(position.x, window.innerWidth - 280) : position.x,
    y: typeof window !== 'undefined' ? Math.min(position.y, window.innerHeight - 300) : position.y,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSave({ label: label.trim(), color });
  };

  const displayCoords = pin?.coordinates ?? coordinates;

  return (
    <div
      ref={popoverRef}
      className="fixed bg-[var(--color-background)] border border-[var(--color-border)] shadow-xl z-50 w-64"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
          <span className="text-sm font-medium">
            {isNew ? 'New Pin' : 'Edit Pin'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[var(--color-accent)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--color-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Label input */}
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">
              Label
            </label>
            <input
              ref={inputRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter pin label"
              className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">
              Color
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-6 h-6 transition-all ${
                    color === presetColor
                      ? 'ring-2 ring-[var(--color-primary)] ring-offset-1'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
          </div>

          {/* Coordinates display */}
          {displayCoords && (
            <div className="text-xs text-[var(--color-muted)]">
              {displayCoords[0].toFixed(4)}, {displayCoords[1].toFixed(4)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex gap-1">
            {!isNew && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 hover:bg-[var(--color-destructive)]/10 transition-colors"
                title="Delete pin"
              >
                <Trash2 className="w-4 h-4 text-[var(--color-destructive)]" />
              </button>
            )}
            {!isNew && onLinkWidgets && (
              <button
                type="button"
                onClick={onLinkWidgets}
                className="p-1.5 hover:bg-[var(--color-accent)] transition-colors"
                title="Link widgets"
              >
                <Link2 className="w-4 h-4 text-[var(--color-muted)]" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!label.trim()}
            className="px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
