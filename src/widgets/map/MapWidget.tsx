import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { ExternalLink, MapPin } from 'lucide-react';
import { useGdeltGeo } from '../../hooks/useGdeltGeo';
import { useEvents } from '../../stores';
import type { MapWidgetConfig, WidgetProps, GeoEvent } from '../../types';
import { formatDistanceToNow } from 'date-fns';

// Fix Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons
const defaultIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: 'selected-marker',
});

// Map controller component for external navigation and resize handling
function MapController({ geoFocus }: { geoFocus: { center: [number, number]; zoom: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (geoFocus) {
      map.flyTo(geoFocus.center, geoFocus.zoom, { duration: 1 });
    }
  }, [geoFocus, map]);

  // Handle container resize - Leaflet needs invalidateSize() when container changes
  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);

  return null;
}

export function MapWidget({ config }: WidgetProps<MapWidgetConfig>) {
  const mapRef = useRef<L.Map | null>(null);
  const { selectedEvent, selectEvent, geoFocus } = useEvents();

  const { data: events = [], isLoading } = useGdeltGeo({
    filters: config.filters,
    timespan: config.filters.timespan,
    pollIntervalMs: config.pollIntervalMs,
  });

  // Handle marker click
  const handleMarkerClick = (event: GeoEvent) => {
    selectEvent(event.id, 'map');
  };

  // Check if geoFocus is from another widget
  const externalGeoFocus = useMemo(() => {
    if (!geoFocus || geoFocus.source === config.id) return null;
    return geoFocus;
  }, [geoFocus, config.id]);

  // Format tone as color using design system variables
  const getToneColor = (tone?: number): string => {
    if (tone === undefined) return 'var(--color-primary)';
    if (tone > 2) return 'var(--color-positive)';
    if (tone < -2) return 'var(--color-destructive)';
    return 'var(--color-neutral)';
  };

  return (
    <div className="h-full w-full relative">
      {isLoading && events.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-background)]/80 z-[1000]">
          <div className="flex items-center gap-2 text-[var(--color-muted)]">
            <MapPin className="w-5 h-5 animate-pulse" />
            <span>Loading events...</span>
          </div>
        </div>
      )}

      <MapContainer
        ref={mapRef}
        center={config.center}
        zoom={config.zoom}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController geoFocus={externalGeoFocus} />

        {config.showClustering ? (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
          >
            {events.map((event) => (
              <Marker
                key={event.id}
                position={event.coordinates}
                icon={selectedEvent.eventId === event.id ? selectedIcon : defaultIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(event),
                }}
              >
                <Popup maxWidth={300}>
                  <EventPopup event={event} toneColor={getToneColor(event.tone)} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        ) : (
          events.map((event) => (
            <Marker
              key={event.id}
              position={event.coordinates}
              icon={selectedEvent.eventId === event.id ? selectedIcon : defaultIcon}
              eventHandlers={{
                click: () => handleMarkerClick(event),
              }}
            >
              <Popup maxWidth={300}>
                <EventPopup event={event} toneColor={getToneColor(event.tone)} />
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>

      {/* Event count badge */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm shadow-md">
        <span className="font-medium">{events.length}</span>
        <span className="text-[var(--color-muted)]"> events</span>
      </div>
    </div>
  );
}

// Event popup component
function EventPopup({ event, toneColor }: { event: GeoEvent; toneColor: string }) {
  return (
    <div className="min-w-[200px]">
      <h3 className="font-medium text-sm mb-2 line-clamp-2">{event.title}</h3>

      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt=""
          className="w-full h-24 object-cover rounded mb-2"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[var(--color-muted)]">Source:</span>
          <span className="font-medium">{event.sourceName}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--color-muted)]">Location:</span>
          <span>{event.locations[0]?.name || 'Unknown'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--color-muted)]">Time:</span>
          <span>{formatDistanceToNow(event.publishedAt, { addSuffix: true })}</span>
        </div>

        {event.tone !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-muted)]">Sentiment:</span>
            <span
              className="px-1.5 py-0.5 rounded text-white text-[10px] font-medium"
              style={{ backgroundColor: toneColor }}
            >
              {event.tone > 2 ? 'Positive' : event.tone < -2 ? 'Negative' : 'Neutral'}
            </span>
          </div>
        )}
      </div>

      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1 w-full py-1.5 bg-[var(--color-primary)] text-white text-xs rounded hover:opacity-90 transition-opacity"
      >
        Read Article
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
