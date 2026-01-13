'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Plane } from 'lucide-react';
import type { WidgetProps } from '../registry';
import type { FlightTrackerWidgetConfig } from './types';
import { useFlightTracker } from './hooks';
import { usePolling } from '../../stores';
import { FlightMarker } from './components/FlightMarker';
import { WidgetError } from '../../components/WidgetError';

interface MapControllerProps {
  center: [number, number] | null;
  zoom: number;
  autoCenter: boolean;
}

function MapController({ center, zoom, autoCenter }: MapControllerProps) {
  const map = useMap();
  const isInitialMount = useRef(true);

  // Handle container resize
  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);

  // Pan to new position when flight moves
  useEffect(() => {
    if (!autoCenter || !center) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      map.setView(center, zoom);
      return;
    }
    map.panTo(center, { animate: true, duration: 0.5 });
  }, [center, zoom, autoCenter, map]);

  return null;
}

export function FlightTrackerWidget({
  config,
  onConfigChange,
}: WidgetProps<FlightTrackerWidgetConfig>) {
  const onConfigChangeRef = useRef(onConfigChange);
  onConfigChangeRef.current = onConfigChange;
  const { isPaused, registerWidget, unregisterWidget } = usePolling();

  const { flight, trail, isLoading, error, refetch, dataUpdatedAt } = useFlightTracker({
    callsign: config.callsign,
    pollIntervalMs: config.pollIntervalMs,
    enabled: !isPaused && !!config.callsign,
  });

  // Register widget status for global connection tracking
  useEffect(() => {
    registerWidget(config.id, {
      isLoading,
      hasError: !!error,
      errorMessage: error?.message,
      lastUpdated: dataUpdatedAt,
    });
    return () => unregisterWidget(config.id);
  }, [config.id, isLoading, error, dataUpdatedAt, registerWidget, unregisterWidget]);

  // Update last known position when flight data changes (only if position changed)
  const lastPositionRef = useRef<[number, number] | null>(config.lastPosition);
  useEffect(() => {
    if (flight?.latitude && flight?.longitude) {
      const newLat = flight.latitude;
      const newLng = flight.longitude;
      const prev = lastPositionRef.current;

      // Only update if position actually changed
      if (!prev || prev[0] !== newLat || prev[1] !== newLng) {
        lastPositionRef.current = [newLat, newLng];
        onConfigChangeRef.current({
          lastPosition: [newLat, newLng],
        });
      }
    }
  }, [flight?.latitude, flight?.longitude]);

  const mapCenter = config.lastPosition || [39.8283, -98.5795]; // Default to US center

  if (!config.callsign) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[var(--color-muted)] p-4">
        <Plane className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm text-center">
          No flight selected.
          <br />
          Click the search icon to enter a flight number.
        </p>
      </div>
    );
  }

  if (error && !flight) {
    return <WidgetError error={error} onRetry={() => refetch()} />;
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={config.zoom}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          center={flight ? [flight.latitude, flight.longitude] : null}
          zoom={config.zoom}
          autoCenter={config.autoCenter}
        />

        {/* Flight trail */}
        {config.showTrail && trail.length > 1 && (
          <Polyline
            positions={trail.map((p) => [p.latitude, p.longitude])}
            color="#3b82f6"
            weight={2}
            opacity={0.6}
            dashArray="5, 5"
          />
        )}

        {/* Aircraft marker */}
        {flight && <FlightMarker flight={flight} />}
      </MapContainer>

      {/* Flight info overlay */}
      {flight && (
        <div className="absolute bottom-2 left-2 right-2 bg-[var(--color-background)]/90 border border-[var(--color-border)] p-2 text-xs">
          <div className="font-bold">{flight.callsign}</div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div>Alt: {flight.altitude.toLocaleString()} ft</div>
            <div>Spd: {flight.groundSpeed} kts</div>
            <div>Hdg: {Math.round(flight.heading)}&deg;</div>
          </div>
          {flight.onGround && (
            <div className="text-amber-500 mt-1">On Ground</div>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && !flight && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-background)]/50">
          <span className="text-sm text-[var(--color-muted)]">
            Searching for {config.callsign}...
          </span>
        </div>
      )}

      {/* Not found state */}
      {!isLoading && !flight && config.callsign && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-background)]/50">
          <span className="text-sm text-[var(--color-muted)]">
            Flight {config.callsign} not found
          </span>
        </div>
      )}
    </div>
  );
}
