import { Globe } from 'lucide-react';
import { WidgetRegistry } from '../registry';
import { MapWidgetDynamic } from './MapWidgetDynamic';
import { MapWidgetHeader } from './MapWidgetHeader';
import type { MapWidgetConfig } from './types';

// Self-register on import - use dynamic component to avoid SSR issues with Leaflet
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
  component: MapWidgetDynamic,
  headerActions: MapWidgetHeader,
});

// Re-export for direct usage if needed
// Note: MapWidget is not exported directly to avoid SSR issues with Leaflet
// Use MapWidgetDynamic instead which handles client-only loading
export { MapWidgetDynamic } from './MapWidgetDynamic';
export { MapWidgetHeader } from './MapWidgetHeader';
export { LocationSearchPopover } from './components';
export type { MapWidgetConfig } from './types';
