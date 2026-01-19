'use client';

import { Maximize2, X } from 'lucide-react';
import { WidgetRegistry } from '@/widgets/registry';
import type { FloatingWidgetInstance } from '@/types/floating.types';

interface MinimizedWidgetBarProps {
  widgets: FloatingWidgetInstance[];
  onRestore: (id: string) => void;
  onClose: (id: string) => void;
}

export function MinimizedWidgetBar({ widgets, onRestore, onClose }: MinimizedWidgetBarProps) {
  const minimizedWidgets = widgets.filter((w) => w.position.isMinimized);

  if (minimizedWidgets.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2 bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg px-2 py-1.5">
      {minimizedWidgets.map((widget) => {
        const definition = WidgetRegistry.get(widget.config.type);
        const Icon = definition?.metadata.icon;

        return (
          <div
            key={widget.config.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors cursor-pointer group"
            onClick={() => onRestore(widget.config.id)}
          >
            {Icon && <Icon className="w-4 h-4 text-[var(--color-muted)]" />}
            <span className="text-sm font-medium max-w-32 truncate">
              {widget.config.title}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(widget.config.id);
                }}
                className="p-0.5 hover:bg-[var(--color-accent)]"
                title="Restore"
              >
                <Maximize2 className="w-3 h-3 text-[var(--color-muted)]" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(widget.config.id);
                }}
                className="p-0.5 hover:bg-[var(--color-destructive)]/10"
                title="Close"
              >
                <X className="w-3 h-3 text-[var(--color-muted)] hover:text-[var(--color-destructive)]" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
