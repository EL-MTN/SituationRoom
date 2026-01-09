import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import RGL, { getCompactor } from 'react-grid-layout';
import { useDashboard } from '../../stores';
import { WidgetWrapper } from '../../widgets/WidgetWrapper';
import { MapWidget } from '../../widgets/map/MapWidget';
import { EventFeedWidget } from '../../widgets/event-feed/EventFeedWidget';
import type { Dashboard, WidgetConfig, WidgetLayout } from '../../types';

// Cast to any to bypass v1 types that don't match v2 API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GridLayout = RGL as any;

// react-grid-layout Layout interface
interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

interface DashboardGridProps {
  dashboard: Dashboard;
}

// Grid padding around the edges (no margin between cells for perfect alignment)
const GRID_PADDING = 4;

// Compactor: no auto-compaction, no overlap, prevent collision (snap back if dropped on another)
const noCompactPreventCollision = getCompactor(null, false, true);

export function DashboardGrid({ dashboard }: DashboardGridProps) {
  const { updateLayouts, removeWidget, updateWidgetConfig } = useDashboard();
  const containerRef = useRef<HTMLDivElement>(null);

  // Track container dimensions from actual element
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions on mount, resize, and when container changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, []);

  const { gridCols, gridRows, showGridLines } = dashboard.settings;

  // Calculate row height based on available height and number of rows
  // With no inter-cell margin, just subtract container padding
  const rowHeight = useMemo(() => {
    if (dimensions.height <= 0) return 50;
    return (dimensions.height - GRID_PADDING * 2) / gridRows;
  }, [dimensions.height, gridRows]);

  // Calculate column width for grid lines
  const colWidth = useMemo(() => {
    if (dimensions.width <= 0) return 0;
    return (dimensions.width - GRID_PADDING * 2) / gridCols;
  }, [dimensions.width, gridCols]);

  // Calculate grid line positions - with no inter-cell margin, lines are evenly spaced
  const columnLinePositions = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i <= gridCols; i++) {
      const pos = Math.round(GRID_PADDING + i * colWidth);
      positions.push(pos);
    }
    return positions;
  }, [colWidth, gridCols]);

  const rowLinePositions = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i <= gridRows; i++) {
      const pos = Math.round(GRID_PADDING + i * rowHeight);
      positions.push(pos);
    }
    return positions;
  }, [rowHeight, gridRows]);

  const layouts = useMemo(
    (): GridLayoutItem[] => dashboard.widgets.map((w) => ({
      i: w.layout.i,
      x: w.layout.x,
      y: w.layout.y,
      w: w.layout.w,
      h: w.layout.h,
      minW: w.layout.minW,
      minH: w.layout.minH,
      maxW: gridCols,
      maxH: gridRows - w.layout.y,
    })),
    [dashboard.widgets, gridCols, gridRows]
  );

  const handleLayoutChange = useCallback(
    (newLayouts: GridLayoutItem[]) => {
      const widgetLayouts: WidgetLayout[] = newLayouts.map((l) => ({
        i: l.i,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
        minW: l.minW,
        minH: l.minH,
      }));
      updateLayouts(dashboard.id, widgetLayouts);
    },
    [dashboard.id, updateLayouts]
  );

  const handleRemoveWidget = useCallback(
    (widgetId: string) => {
      removeWidget(dashboard.id, widgetId);
    },
    [dashboard.id, removeWidget]
  );

  const handleConfigChange = useCallback(
    (widgetId: string, config: Partial<WidgetConfig>) => {
      updateWidgetConfig(dashboard.id, widgetId, config);
    },
    [dashboard.id, updateWidgetConfig]
  );

  const renderWidget = (config: WidgetConfig) => {
    const props = {
      config,
      onConfigChange: (c: Partial<WidgetConfig>) => handleConfigChange(config.id, c),
      isEditing: false,
    };

    switch (config.type) {
      case 'map':
        return <MapWidget {...props} config={config} />;
      case 'event-feed':
        return <EventFeedWidget {...props} config={config} />;
      default:
        return (
          <div className="h-full flex items-center justify-center text-(--color-muted)">
            Unknown widget type
          </div>
        );
    }
  };

  return (
    <div ref={containerRef} className="relative h-full min-h-0">
      {/* Grid lines overlay */}
      {showGridLines && dimensions.width > 0 && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {columnLinePositions.map((left, i) => (
            <div
              key={`col-${i}`}
              className="absolute top-0 bottom-0 w-px bg-(--color-border) opacity-30"
              style={{ left }}
            />
          ))}
          {rowLinePositions.map((top, i) => (
            <div
              key={`row-${i}`}
              className="absolute left-0 right-0 h-px bg-(--color-border) opacity-30"
              style={{ top }}
            />
          ))}
        </div>
      )}

      {/* Grid layout - using react-grid-layout v2 API */}
      <GridLayout
        key={`grid-${Math.round(rowHeight)}`}
        className="layout relative z-10"
        layout={layouts}
        width={dimensions.width}
        onLayoutChange={handleLayoutChange}
        gridConfig={{
          cols: gridCols,
          rowHeight: rowHeight,
          margin: [0, 0],
          containerPadding: [GRID_PADDING, GRID_PADDING],
          maxRows: gridRows,
        }}
        resizeConfig={{
          enabled: true,
          handles: ['e', 'se', 's', 'sw', 'w'],
        }}
        dragConfig={{
          enabled: true,
        }}
        compactor={noCompactPreventCollision}
      >
        {dashboard.widgets.map((widget) => (
          <div key={widget.config.id}>
            <WidgetWrapper
              config={widget.config}
              onRemove={() => handleRemoveWidget(widget.config.id)}
              onConfigChange={(c) => handleConfigChange(widget.config.id, c)}
            >
              {renderWidget(widget.config)}
            </WidgetWrapper>
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
