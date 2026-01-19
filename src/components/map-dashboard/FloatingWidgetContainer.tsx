'use client';

import { WidgetRegistry } from '@/widgets/registry';
import type { FloatingWidgetInstance } from '@/types/floating.types';
import type { FloatingWidgetPosition } from '@/types/floating.types';
import type { BaseWidgetConfig } from '@/widgets/registry/types';
import { FloatingPanel } from './FloatingPanel';
import { MinimizedWidgetBar } from './MinimizedWidgetBar';

interface FloatingWidgetContainerProps {
  widgets: FloatingWidgetInstance[];
  onPositionChange: (id: string, position: Partial<FloatingWidgetPosition>) => void;
  onConfigChange: (id: string, config: Partial<BaseWidgetConfig>) => void;
  onRemove: (id: string) => void;
  onFocus: (id: string) => void;
  onRestore: (id: string) => void;
}

export function FloatingWidgetContainer({
  widgets,
  onPositionChange,
  onConfigChange,
  onRemove,
  onFocus,
  onRestore,
}: FloatingWidgetContainerProps) {
  return (
    <>
      {/* Floating widget layer - pointer-events-none to allow clicks through to map */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {widgets.map((widget) => {
          if (widget.position.isMinimized) return null;

          const definition = WidgetRegistry.get(widget.config.type);
          if (!definition) return null;

          const WidgetComponent = definition.component;

          return (
            <FloatingPanel
              key={widget.config.id}
              config={widget.config}
              position={widget.position}
              onPositionChange={(pos) => onPositionChange(widget.config.id, pos)}
              onConfigChange={(cfg) => onConfigChange(widget.config.id, cfg)}
              onRemove={() => onRemove(widget.config.id)}
              onFocus={() => onFocus(widget.config.id)}
            >
              <WidgetComponent
                config={widget.config}
                onConfigChange={(cfg) => onConfigChange(widget.config.id, cfg)}
                locationContext={widget.locationContext}
              />
            </FloatingPanel>
          );
        })}
      </div>

      {/* Minimized widget bar */}
      <MinimizedWidgetBar
        widgets={widgets}
        onRestore={onRestore}
        onClose={onRemove}
      />
    </>
  );
}
