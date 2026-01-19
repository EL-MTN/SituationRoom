'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Check, MapPin } from 'lucide-react';
import { WidgetRegistry } from '@/widgets/registry';
import type { MapPin as MapPinType } from '@/types/pin.types';

interface WidgetLinkingDialogProps {
  pin: MapPinType;
  onLink: (widgetType: string) => void;
  onUnlink: (widgetType: string) => void;
  onClose: () => void;
}

export function WidgetLinkingDialog({
  pin,
  onLink,
  onUnlink,
  onClose,
}: WidgetLinkingDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(pin.linkedWidgetConfigs.map((c) => c.widgetType))
  );

  const allWidgets = WidgetRegistry.getAllMetadata();
  // Filter out the map widget since it's now the background
  const availableWidgets = allWidgets.filter((w) => w.type !== 'map');

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay adding listener to prevent immediate close
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleToggle = (widgetType: string) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(widgetType)) {
      newSelected.delete(widgetType);
      onUnlink(widgetType);
    } else {
      newSelected.add(widgetType);
      onLink(widgetType);
    }
    setSelectedTypes(newSelected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        ref={dialogRef}
        className="bg-[var(--color-background)] border border-[var(--color-border)] shadow-xl w-80 max-h-[70vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="font-medium text-sm">Link Widgets to Pin</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--color-accent)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--color-muted)]" />
          </button>
        </div>

        {/* Pin info */}
        <div className="px-4 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: pin.color ?? '#3b82f6' }}
            />
            <span className="text-sm font-medium">{pin.label}</span>
          </div>
          <div className="text-xs text-[var(--color-muted)] mt-0.5">
            {pin.coordinates[0].toFixed(4)}, {pin.coordinates[1].toFixed(4)}
          </div>
        </div>

        {/* Widget list */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs text-[var(--color-muted)] px-2 py-1 mb-1">
            Select widgets to open when clicking this pin
          </div>
          <div className="space-y-1">
            {availableWidgets.map((widget) => {
              const isLinked = selectedTypes.has(widget.type);
              const Icon = widget.icon;

              return (
                <button
                  key={widget.type}
                  onClick={() => handleToggle(widget.type)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    isLinked
                      ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30'
                      : 'hover:bg-[var(--color-accent)] border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[var(--color-muted)]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{widget.displayName}</div>
                    {widget.description && (
                      <div className="text-xs text-[var(--color-muted)] truncate">
                        {widget.description}
                      </div>
                    )}
                  </div>
                  {isLinked && (
                    <Check className="w-4 h-4 text-[var(--color-primary)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="text-xs text-[var(--color-muted)]">
            {selectedTypes.size} widget{selectedTypes.size !== 1 ? 's' : ''} linked
          </div>
        </div>
      </div>
    </div>
  );
}
