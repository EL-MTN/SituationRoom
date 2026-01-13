'use client';

import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { FlightState } from '../types';

interface FlightMarkerProps {
  flight: FlightState;
}

function createAircraftIcon(heading: number, onGround: boolean) {
  const color = onGround ? '#f59e0b' : '#3b82f6';

  return L.divIcon({
    html: `
      <div style="
        transform: rotate(${heading}deg);
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg viewBox="0 0 24 24" fill="${color}" width="24" height="24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
    `,
    className: 'aircraft-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

export function FlightMarker({ flight }: FlightMarkerProps) {
  const icon = useMemo(
    () => createAircraftIcon(flight.heading, flight.onGround),
    [flight.heading, flight.onGround]
  );

  return (
    <Marker position={[flight.latitude, flight.longitude]} icon={icon}>
      <Popup>
        <div className="min-w-[150px]">
          <h3 className="font-bold text-sm">{flight.callsign}</h3>
          <p className="text-xs text-gray-500">{flight.originCountry}</p>
          <div className="mt-2 text-xs space-y-1">
            <div>Altitude: {flight.altitude.toLocaleString()} ft</div>
            <div>Ground Speed: {flight.groundSpeed} kts</div>
            <div>Heading: {Math.round(flight.heading)}&deg;</div>
            <div>
              Vertical Rate: {flight.verticalRate > 0 ? '+' : ''}
              {flight.verticalRate} ft/min
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
