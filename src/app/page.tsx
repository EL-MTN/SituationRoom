import { Suspense } from 'react'
import { DashboardPage } from '@/features/dashboard/DashboardPage'

export default function Home() {
  return (
    <Suspense fallback={null}>
      <DashboardPage />
    </Suspense>
  )
}
