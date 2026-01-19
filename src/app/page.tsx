import { Suspense } from 'react'
import { MapDashboardDynamic } from '@/components/map-dashboard'

export default function Home() {
  return (
    <Suspense fallback={null}>
      <MapDashboardDynamic />
    </Suspense>
  )
}
