'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import type { MapState } from './BackgroundMap';

interface BackgroundMapProps {
  mapState: MapState;
  onMapStateChange?: (state: MapState) => void;
  onMapClick?: (coordinates: [number, number]) => void;
  children?: ReactNode;
}

// Dynamically import BackgroundMap with SSR disabled to avoid Leaflet's window access
const BackgroundMapInner = dynamic(
  () => import('./BackgroundMap').then((mod) => mod.BackgroundMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-[var(--color-surface)] text-[var(--color-muted)]">
        Loading map...
      </div>
    ),
  }
);

export function BackgroundMap(props: BackgroundMapProps) {
  return <BackgroundMapInner {...props} />;
}
