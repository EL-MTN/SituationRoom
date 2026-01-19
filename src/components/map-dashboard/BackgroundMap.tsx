'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapState {
  center: [number, number];
  zoom: number;
}

interface BackgroundMapProps {
  mapState: MapState;
  onMapStateChange?: (state: MapState) => void;
  onMapClick?: (coordinates: [number, number]) => void;
  children?: ReactNode;
}

/**
 * Controller component for handling map resize and state syncing
 */
function MapController({
  center,
  zoom,
  onMapStateChange,
  onMapClick,
}: {
  center: [number, number];
  zoom: number;
  onMapStateChange?: (state: MapState) => void;
  onMapClick?: (coordinates: [number, number]) => void;
}) {
  const map = useMap();
  const isInitialMount = useRef(true);
  const isProgrammaticMove = useRef(false);

  // Handle container resize - Leaflet needs invalidateSize() when container changes
  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);

  // Fly to new location when center/zoom changes from external source
  useEffect(() => {
    // Skip the initial mount - MapContainer already sets initial position
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    isProgrammaticMove.current = true;
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);

  // Handle map events
  useMapEvents({
    click: (e) => {
      onMapClick?.([e.latlng.lat, e.latlng.lng]);
    },
    moveend: () => {
      // Don't emit state change if this was a programmatic move
      if (isProgrammaticMove.current) {
        isProgrammaticMove.current = false;
        return;
      }
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMapStateChange?.({
        center: [center.lat, center.lng],
        zoom,
      });
    },
  });

  return null;
}

/**
 * Inner map component (must be dynamically imported to avoid SSR issues)
 */
function BackgroundMapInner({
  mapState,
  onMapStateChange,
  onMapClick,
  children,
}: BackgroundMapProps) {
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={mapState.center}
        zoom={mapState.zoom}
        className="h-full w-full"
        scrollWheelZoom
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController
          center={mapState.center}
          zoom={mapState.zoom}
          onMapStateChange={onMapStateChange}
          onMapClick={onMapClick}
        />
        {children}
      </MapContainer>
    </div>
  );
}

export { BackgroundMapInner };
