'use client';

import { useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { MapPin } from '@/types/pin.types';

interface PinMarkerProps {
  pin: MapPin;
  onClick: (pin: MapPin) => void;
  onContextMenu: (pin: MapPin, e: L.LeafletMouseEvent) => void;
}

const DEFAULT_COLOR = '#3b82f6'; // Blue

function createPinIcon(color: string = DEFAULT_COLOR, hasLinkedWidgets: boolean = false) {
  const size = 32;
  const strokeWidth = 2;
  const innerColor = color;
  const dotColor = hasLinkedWidgets ? '#ffffff' : innerColor;
  const dotSize = hasLinkedWidgets ? 6 : 4;

  // Create an SVG pin marker
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z"
        fill="${innerColor}"
        stroke="#ffffff"
        stroke-width="${strokeWidth}"
      />
      <circle cx="16" cy="12" r="${dotSize}" fill="${dotColor}" />
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-pin-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export function PinMarker({ pin, onClick, onContextMenu }: PinMarkerProps) {
  const hasLinkedWidgets = pin.linkedWidgetConfigs.length > 0;

  const icon = useMemo(
    () => createPinIcon(pin.color, hasLinkedWidgets),
    [pin.color, hasLinkedWidgets]
  );

  const eventHandlers = useMemo(
    () => ({
      click: () => onClick(pin),
      contextmenu: (e: L.LeafletMouseEvent) => {
        e.originalEvent.preventDefault();
        onContextMenu(pin, e);
      },
    }),
    [pin, onClick, onContextMenu]
  );

  return (
    <Marker position={pin.coordinates} icon={icon} eventHandlers={eventHandlers}>
      <Tooltip direction="top" offset={[0, -30]}>
        <div className="text-sm font-medium">{pin.label}</div>
        {hasLinkedWidgets && (
          <div className="text-xs text-gray-500">
            {pin.linkedWidgetConfigs.length} linked widget
            {pin.linkedWidgetConfigs.length !== 1 ? 's' : ''}
          </div>
        )}
      </Tooltip>
    </Marker>
  );
}
