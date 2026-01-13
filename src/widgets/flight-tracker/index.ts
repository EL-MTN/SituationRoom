import { Plane } from 'lucide-react';
import { WidgetRegistry } from '../registry';
import { FlightTrackerWidgetDynamic } from './FlightTrackerWidgetDynamic';
import { FlightTrackerWidgetHeader } from './FlightTrackerWidgetHeader';
import { FlightTrackerWidgetToolbar } from './FlightTrackerWidgetToolbar';
import type { FlightTrackerWidgetConfig } from './types';

// Self-register on import
WidgetRegistry.register<FlightTrackerWidgetConfig>({
  metadata: {
    type: 'flight-tracker',
    displayName: 'Flight Tracker',
    description: 'Track live flights on an interactive map',
    icon: Plane,
  },
  defaults: {
    config: {
      type: 'flight-tracker',
      title: 'Flight Tracker',
      callsign: '',
      pollIntervalMs: 15000,
      showTrail: true,
      autoCenter: true,
      zoom: 6,
      lastPosition: null,
    },
    layout: { w: 8, h: 10, minW: 4, minH: 4 },
  },
  component: FlightTrackerWidgetDynamic,
  headerActions: FlightTrackerWidgetHeader,
  toolbarItems: FlightTrackerWidgetToolbar,
});

export { FlightTrackerWidgetDynamic } from './FlightTrackerWidgetDynamic';
export { FlightTrackerWidgetHeader } from './FlightTrackerWidgetHeader';
export { FlightTrackerWidgetToolbar } from './FlightTrackerWidgetToolbar';
export type { FlightTrackerWidgetConfig } from './types';
