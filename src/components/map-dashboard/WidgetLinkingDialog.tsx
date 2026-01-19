'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Check, MapPin, ChevronDown, Settings } from 'lucide-react';
import { WidgetRegistry } from '@/widgets/registry';
import type { MapPin as MapPinType, LinkedWidgetConfig } from '@/types/pin.types';

interface WidgetLinkingDialogProps {
  pin: MapPinType;
  onLink: (linkedConfig: LinkedWidgetConfig) => void;
  onUpdate: (widgetType: string, updates: Partial<LinkedWidgetConfig>) => void;
  onUnlink: (widgetType: string) => void;
  onClose: () => void;
}

export function WidgetLinkingDialog({
  pin,
  onLink,
  onUpdate,
  onUnlink,
  onClose,
}: WidgetLinkingDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [linkedTypes, setLinkedTypes] = useState<Set<string>>(
    new Set(pin.linkedWidgetConfigs.map((c) => c.widgetType))
  );
  const [expandedWidgets, setExpandedWidgets] = useState<Set<string>>(new Set());

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

  // Update linked types when pin changes
  useEffect(() => {
    setLinkedTypes(new Set(pin.linkedWidgetConfigs.map((c) => c.widgetType)));
  }, [pin.linkedWidgetConfigs]);

  const handleToggle = (widgetType: string) => {
    const newLinkedTypes = new Set(linkedTypes);
    if (newLinkedTypes.has(widgetType)) {
      newLinkedTypes.delete(widgetType);
      setExpandedWidgets((prev) => {
        const next = new Set(prev);
        next.delete(widgetType);
        return next;
      });
      onUnlink(widgetType);
    } else {
      newLinkedTypes.add(widgetType);
      onLink({ widgetType });
    }
    setLinkedTypes(newLinkedTypes);
  };

  const toggleExpand = (widgetType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(widgetType)) {
        next.delete(widgetType);
      } else {
        next.add(widgetType);
      }
      return next;
    });
  };

  const getLinkedConfig = (widgetType: string): LinkedWidgetConfig | undefined => {
    return pin.linkedWidgetConfigs.find((c) => c.widgetType === widgetType);
  };

  const handleSettingChange = (
    widgetType: string,
    field: keyof LinkedWidgetConfig,
    value: string | boolean | number | undefined
  ) => {
    onUpdate(widgetType, { [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        ref={dialogRef}
        className="bg-[var(--color-background)] border border-[var(--color-border)] shadow-xl w-96 max-h-[80vh] flex flex-col"
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
              const isLinked = linkedTypes.has(widget.type);
              const isExpanded = expandedWidgets.has(widget.type);
              const linkedConfig = getLinkedConfig(widget.type);
              const Icon = widget.icon;
              const definition = WidgetRegistry.get(widget.type);
              const supportsQuery = definition?.supportsLocationContext;

              return (
                <div key={widget.type}>
                  <div
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                      isLinked
                        ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30'
                        : 'hover:bg-[var(--color-accent)] border border-transparent'
                    }`}
                  >
                    <div
                      className="flex-1 flex items-center gap-3 cursor-pointer"
                      onClick={() => handleToggle(widget.type)}
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
                    </div>
                    {isLinked && supportsQuery && (
                      <button
                        onClick={(e) => toggleExpand(widget.type, e)}
                        className="p-1 hover:bg-[var(--color-accent)] transition-colors rounded"
                        title="Widget settings"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-[var(--color-muted)]" />
                        ) : (
                          <Settings className="w-3 h-3 text-[var(--color-muted)]" />
                        )}
                      </button>
                    )}
                    {isLinked && (
                      <Check className="w-4 h-4 text-[var(--color-primary)]" />
                    )}
                  </div>

                  {/* Expanded settings */}
                  {isLinked && isExpanded && supportsQuery && (
                    <div className="ml-7 mr-2 mb-2 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
                      {/* Custom query override */}
                      <div>
                        <label className="block text-xs text-[var(--color-muted)] mb-1">
                          Custom search query (optional)
                        </label>
                        <input
                          type="text"
                          value={linkedConfig?.queryOverride ?? ''}
                          onChange={(e) =>
                            handleSettingChange(
                              widget.type,
                              'queryOverride',
                              e.target.value || undefined
                            )
                          }
                          placeholder={`e.g., "UK politics" or "${pin.label}"`}
                          className="w-full px-2 py-1.5 text-sm bg-[var(--color-background)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
                        />
                        <div className="text-xs text-[var(--color-muted)] mt-0.5">
                          Leave empty to auto-detect location name
                        </div>
                      </div>

                      {/* Use location query toggle */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`useLocation-${widget.type}`}
                          checked={linkedConfig?.useLocationQuery !== false}
                          onChange={(e) =>
                            handleSettingChange(
                              widget.type,
                              'useLocationQuery',
                              e.target.checked
                            )
                          }
                          className="w-3.5 h-3.5 accent-[var(--color-primary)]"
                        />
                        <label
                          htmlFor={`useLocation-${widget.type}`}
                          className="text-xs text-[var(--color-foreground)]"
                        >
                          Use location name in query
                        </label>
                      </div>

                      {/* Radius setting */}
                      <div>
                        <label className="block text-xs text-[var(--color-muted)] mb-1">
                          Search radius (km)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={linkedConfig?.radiusKm ?? 50}
                          onChange={(e) =>
                            handleSettingChange(
                              widget.type,
                              'radiusKm',
                              parseInt(e.target.value) || 50
                            )
                          }
                          className="w-24 px-2 py-1.5 text-sm bg-[var(--color-background)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="text-xs text-[var(--color-muted)]">
            {linkedTypes.size} widget{linkedTypes.size !== 1 ? 's' : ''} linked
          </div>
        </div>
      </div>
    </div>
  );
}
