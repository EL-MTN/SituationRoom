'use client';

import dynamic from 'next/dynamic';
import type { WidgetProps } from '../registry';
import type { FlightTrackerWidgetConfig } from './types';

const FlightTrackerWidgetInner = dynamic(
  () => import('./FlightTrackerWidget').then((mod) => mod.FlightTrackerWidget),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-[var(--color-muted)]">
        Loading flight tracker...
      </div>
    ),
  }
);

export function FlightTrackerWidgetDynamic(props: WidgetProps<FlightTrackerWidgetConfig>) {
  return <FlightTrackerWidgetInner {...props} />;
}
