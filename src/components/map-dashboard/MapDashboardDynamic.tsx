'use client';

import dynamic from 'next/dynamic';

// Dynamically import MapDashboard with SSR disabled to avoid Leaflet's window access
const MapDashboardInner = dynamic(
  () => import('./MapDashboard').then((mod) => mod.MapDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-surface)] text-[var(--color-muted)]">
        Loading dashboard...
      </div>
    ),
  }
);

export function MapDashboardDynamic() {
  return <MapDashboardInner />;
}
