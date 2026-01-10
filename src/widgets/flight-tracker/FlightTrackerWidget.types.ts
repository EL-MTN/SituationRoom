import type { BaseWidgetConfig } from '../registry';

export interface FlightTrackerWidgetConfig extends BaseWidgetConfig {
  type: 'flight-tracker';
  /** Flight callsign to track (e.g., "UAL123", "DLH456") */
  callsign: string;
  /** Polling interval in milliseconds */
  pollIntervalMs: number;
  /** Show flight trail/history */
  showTrail: boolean;
  /** Auto-center map on aircraft */
  autoCenter: boolean;
  /** Map zoom level */
  zoom: number;
  /** Last known position for map centering */
  lastPosition: [number, number] | null;
}
