'use client';

import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { WidgetRegistry } from '@/widgets/registry';

interface AddWidgetMenuProps {
  onSelect: (type: string) => void;
  onClose: () => void;
}

export function AddWidgetMenu({ onSelect, onClose }: AddWidgetMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const allWidgets = WidgetRegistry.getAllMetadata();
  // Filter out the map widget since it's now the background
  const availableWidgets = allWidgets.filter((w) => w.type !== 'map');

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute top-16 right-4 z-40 bg-[var(--color-background)] border border-[var(--color-border)] shadow-xl w-72"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <span className="font-medium text-sm">Add Widget</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[var(--color-accent)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--color-muted)]" />
        </button>
      </div>

      {/* Widget list */}
      <div className="max-h-96 overflow-y-auto p-2">
        <div className="space-y-1">
          {availableWidgets.map((widget) => {
            const Icon = widget.icon;

            return (
              <button
                key={widget.type}
                onClick={() => onSelect(widget.type)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--color-accent)] transition-colors"
              >
                <Icon className="w-5 h-5 text-[var(--color-muted)]" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{widget.displayName}</div>
                  {widget.description && (
                    <div className="text-xs text-[var(--color-muted)] truncate">
                      {widget.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
