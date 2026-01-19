'use client';

import type L from 'leaflet';
import type { MapPin } from '@/types/pin.types';
import { PinMarker } from './PinMarker';
import { useMapDashboard } from '@/stores/MapDashboardContext';

interface PinMarkersProps {
  onPinClick: (pin: MapPin) => void;
  onPinContextMenu: (pin: MapPin, e: L.LeafletMouseEvent) => void;
}

/**
 * Renders only the pin markers on the map.
 * Popovers and dialogs are handled separately in MapDashboard.
 */
export function PinMarkers({ onPinClick, onPinContextMenu }: PinMarkersProps) {
  const { state } = useMapDashboard();

  return (
    <>
      {state.pins.map((pin) => (
        <PinMarker
          key={pin.id}
          pin={pin}
          onClick={onPinClick}
          onContextMenu={onPinContextMenu}
        />
      ))}
    </>
  );
}
