import { Globe } from 'lucide-react';
import { WidgetRegistry } from '../registry';
import { MapWidget } from './MapWidget';
import { MapWidgetHeader } from './MapWidgetHeader';
import type { MapWidgetConfig } from './MapWidget.types';

// Self-register on import
WidgetRegistry.register<MapWidgetConfig>({
  metadata: {
    type: 'map',
    displayName: 'Map',
    description: 'Interactive map with location search',
    icon: Globe,
  },
  defaults: {
    config: {
      type: 'map',
      title: 'Map',
      center: [20, 0],
      zoom: 2,
      showConflicts: true,
    },
    layout: { w: 8, h: 10, minW: 4, minH: 3 },
  },
  component: MapWidget,
  headerActions: MapWidgetHeader,
});

// Re-export for direct usage if needed
export { MapWidget } from './MapWidget';
export { MapWidgetHeader } from './MapWidgetHeader';
export { LocationSearchPopover } from './LocationSearchPopover';
export type { MapWidgetConfig } from './MapWidget.types';
