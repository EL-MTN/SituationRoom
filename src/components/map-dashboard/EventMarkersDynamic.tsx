'use client';

import dynamic from 'next/dynamic';

// Dynamically import EventMarkers with SSR disabled to avoid Leaflet's window access
export const EventMarkers = dynamic(
  () => import('./EventMarkers').then((mod) => mod.EventMarkers),
  {
    ssr: false,
    loading: () => null, // No loading state needed for markers
  }
);
