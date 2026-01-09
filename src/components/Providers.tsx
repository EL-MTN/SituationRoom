'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardProvider, EventProvider } from '@/stores'
import { useState, type ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardProvider>
        <EventProvider>{children}</EventProvider>
      </DashboardProvider>
    </QueryClientProvider>
  )
}
