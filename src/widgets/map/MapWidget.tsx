import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapWidgetConfig, WidgetProps } from '../../types';

interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

// Map controller component for resize handling and location changes
function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap();
  const isInitialMount = useRef(true);

  // Handle container resize - Leaflet needs invalidateSize() when container changes
  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);

  // Fly to new location when center/zoom changes
  useEffect(() => {
    // Skip the initial mount - MapContainer already sets initial position
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);

  return null;
}

export function MapWidget({ config }: WidgetProps<MapWidgetConfig>) {
  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={config.center}
        zoom={config.zoom}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={config.center} zoom={config.zoom} />
      </MapContainer>
    </div>
  );
}
