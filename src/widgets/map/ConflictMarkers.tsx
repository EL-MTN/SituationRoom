import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { GdeltGeoFeature } from '../../types';

// Import cluster CSS
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

// MarkerCluster type from leaflet.markercluster
interface MarkerCluster {
  getChildCount(): number;
}

interface ConflictMarkersProps {
  features: GdeltGeoFeature[];
}

// Create a custom conflict marker icon
function createConflictIcon(count: number) {
  const size = Math.min(40, Math.max(24, 16 + Math.log10(count + 1) * 10));
  const color = count > 100 ? '#dc2626' : count > 20 ? '#f97316' : '#eab308';

  return L.divIcon({
    html: `<div style="
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: bold;
    ">${count > 99 ? '99+' : count}</div>`,
    className: 'conflict-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Custom cluster icon
function createClusterIcon(cluster: MarkerCluster) {
  const count = cluster.getChildCount();
  const size = Math.min(50, Math.max(30, 20 + Math.log10(count + 1) * 12));

  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #dc2626, #991b1b);
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.9);
      box-shadow: 0 3px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    ">${count}</div>`,
    className: 'conflict-cluster',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Parse HTML links from GDELT response
function parseHtmlLinks(html: string): { title: string; url: string }[] {
  const links: { title: string; url: string }[] = [];
  const regex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push({ url: match[1], title: match[2] });
  }
  return links.slice(0, 3); // Max 3 links
}

export function ConflictMarkers({ features }: ConflictMarkersProps) {
  const markers = useMemo(() => {
    return features.map((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const { name, count, html } = feature.properties;
      const links = html ? parseHtmlLinks(html) : [];

      return {
        id: `${lat}-${lng}-${name}`,
        position: [lat, lng] as [number, number],
        name,
        count,
        links,
        icon: createConflictIcon(count),
      };
    });
  }, [features]);

  if (markers.length === 0) {
    return null;
  }

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createClusterIcon}
      maxClusterRadius={60}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={marker.icon}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold text-sm mb-1">{marker.name}</h3>
              <p className="text-xs text-gray-500 mb-2">
                {marker.count} news mentions
              </p>
              {marker.links.length > 0 && (
                <div className="space-y-1">
                  {marker.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:underline truncate"
                    >
                      {link.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
