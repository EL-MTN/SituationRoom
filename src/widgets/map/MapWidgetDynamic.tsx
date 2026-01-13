'use client'

import dynamic from 'next/dynamic'
import type { WidgetProps } from '../registry'
import type { MapWidgetConfig } from './types'

// Dynamically import MapWidget with SSR disabled to avoid Leaflet's window access
const MapWidgetInner = dynamic(
  () => import('./MapWidget').then((mod) => mod.MapWidget),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-[var(--color-muted)]">
        Loading map...
      </div>
    ),
  }
)

export function MapWidgetDynamic(props: WidgetProps<MapWidgetConfig>) {
  return <MapWidgetInner {...props} />
}
