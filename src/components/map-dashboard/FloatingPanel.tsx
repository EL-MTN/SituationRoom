'use client';

import { useRef, useState, useEffect, useCallback, type ReactNode, type MouseEvent } from 'react';
import { X, Minus, Maximize2, RefreshCw, GripVertical } from 'lucide-react';
import { WidgetRegistry } from '@/widgets/registry';
import type { BaseWidgetConfig } from '@/widgets/registry';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { FloatingWidgetPosition } from '@/types/floating.types';

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

interface FloatingPanelProps {
  config: BaseWidgetConfig;
  position: FloatingWidgetPosition;
  onPositionChange: (position: Partial<FloatingWidgetPosition>) => void;
  onRemove: () => void;
  onConfigChange: (config: Partial<BaseWidgetConfig>) => void;
  onFocus: () => void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
  children: ReactNode;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export function FloatingPanel({
  config,
  position,
  onPositionChange,
  onRemove,
  onConfigChange,
  onFocus,
  isLoading,
  lastUpdated,
  children,
}: FloatingPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<ResizeDirection | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

  // Get widget definition from registry
  const definition = WidgetRegistry.get(config.type);
  const HeaderActions = definition?.headerActions;
  const ToolbarItems = definition?.toolbarItems;

  // Get min dimensions from widget definition or fallback to constants
  const minWidth = definition?.floatingDefaults?.minWidth ?? MIN_WIDTH;
  const minHeight = definition?.floatingDefaults?.minHeight ?? MIN_HEIGHT;

  // Handle drag start
  const handleDragStart = useCallback((e: MouseEvent) => {
    e.preventDefault();
    onFocus();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [position.x, position.y, onFocus]);

  // Handle resize start
  const handleResizeStart = useCallback((e: MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    setIsResizing(true);
    setResizeDir(direction);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: position.width,
      height: position.height,
      posX: position.x,
      posY: position.y,
    };
  }, [position.width, position.height, position.x, position.y, onFocus]);

  // Handle minimize toggle
  const handleMinimize = useCallback(() => {
    onPositionChange({ isMinimized: !position.isMinimized });
  }, [position.isMinimized, onPositionChange]);

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        const newX = Math.max(0, dragStartRef.current.posX + deltaX);
        const newY = Math.max(0, dragStartRef.current.posY + deltaY);
        onPositionChange({ x: newX, y: newY });
      } else if (isResizing && resizeDir) {
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;

        let newWidth = resizeStartRef.current.width;
        let newHeight = resizeStartRef.current.height;
        let newX = resizeStartRef.current.posX;
        let newY = resizeStartRef.current.posY;

        // Handle horizontal resize
        if (resizeDir.includes('e')) {
          newWidth = Math.max(minWidth, resizeStartRef.current.width + deltaX);
        } else if (resizeDir.includes('w')) {
          const potentialWidth = resizeStartRef.current.width - deltaX;
          if (potentialWidth >= minWidth) {
            newWidth = potentialWidth;
            newX = resizeStartRef.current.posX + deltaX;
          }
        }

        // Handle vertical resize
        if (resizeDir.includes('s')) {
          newHeight = Math.max(minHeight, resizeStartRef.current.height + deltaY);
        } else if (resizeDir.includes('n')) {
          const potentialHeight = resizeStartRef.current.height - deltaY;
          if (potentialHeight >= minHeight) {
            newHeight = potentialHeight;
            newY = resizeStartRef.current.posY + deltaY;
          }
        }

        onPositionChange({ x: newX, y: newY, width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDir(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeDir, minWidth, minHeight, onPositionChange]);

  // Don't render if minimized (handled by MinimizedWidgetBar)
  if (position.isMinimized) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="absolute bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg flex flex-col"
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height,
        zIndex: position.zIndex,
        pointerEvents: 'auto',
      }}
      onMouseDown={() => onFocus()}
    >
      {/* Header - drag handle */}
      <div
        className="relative flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-accent)]/50 cursor-grab select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-[var(--color-muted)]" />

          {HeaderActions ? (
            <div onMouseDown={(e) => e.stopPropagation()}>
              <HeaderActions config={config} onConfigChange={onConfigChange} />
            </div>
          ) : (
            <span className="font-medium text-sm" onMouseDown={(e) => e.stopPropagation()}>
              {config.title}
            </span>
          )}

          {isLoading && (
            <RefreshCw className="w-3 h-3 text-[var(--color-primary)] animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
          {lastUpdated && (
            <span className="text-xs text-[var(--color-muted)] mr-2">
              {formatRelativeTime(lastUpdated)}
            </span>
          )}

          {ToolbarItems && (
            <ToolbarItems config={config} onConfigChange={onConfigChange} />
          )}

          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-[var(--color-accent)] transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4 text-[var(--color-muted)]" />
          </button>

          <button
            onClick={() => {
              // Toggle between normal and larger size
              if (position.width >= 800 && position.height >= 600) {
                onPositionChange({ width: 400, height: 300 });
              } else {
                onPositionChange({ width: 800, height: 600 });
              }
            }}
            className="p-1 hover:bg-[var(--color-accent)] transition-colors"
            title="Maximize"
          >
            <Maximize2 className="w-4 h-4 text-[var(--color-muted)]" />
          </button>

          <button
            onClick={onRemove}
            className="p-1 hover:bg-[var(--color-destructive)]/10 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-[var(--color-muted)] hover:text-[var(--color-destructive)]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>

      {/* Resize handles */}
      {/* Edges */}
      <div
        className="absolute top-0 left-2 right-2 h-1 cursor-n-resize"
        onMouseDown={(e) => handleResizeStart(e, 'n')}
      />
      <div
        className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize"
        onMouseDown={(e) => handleResizeStart(e, 's')}
      />
      <div
        className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize"
        onMouseDown={(e) => handleResizeStart(e, 'w')}
      />
      <div
        className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize"
        onMouseDown={(e) => handleResizeStart(e, 'e')}
      />

      {/* Corners */}
      <div
        className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
      />
      <div
        className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
      />
      <div
        className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
        onMouseDown={(e) => handleResizeStart(e, 'se')}
      />
    </div>
  );
}
