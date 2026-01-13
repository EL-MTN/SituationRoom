'use client';

import { useState, useRef } from 'react';
import { Plane } from 'lucide-react';
import { FlightSearchPopover } from './components';
import type { WidgetHeaderExtensionProps } from '../registry';
import type { FlightTrackerWidgetConfig } from './types';

export function FlightTrackerWidgetHeader({
  config,
  onConfigChange,
}: WidgetHeaderExtensionProps<FlightTrackerWidgetConfig>) {
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const displayCallsign = config.callsign || 'Enter flight...';
  const hasCallsign = Boolean(config.callsign);

  return (
    <>
      <button
        ref={searchButtonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowSearchPopover(!showSearchPopover);
        }}
        className={`flex items-center gap-1.5 px-2 py-1 text-sm transition-colors ${
          hasCallsign
            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
            : 'hover:bg-[var(--color-accent)] text-[var(--color-muted)]'
        }`}
        title="Search flight"
      >
        <Plane className="w-4 h-4" />
        <span className="font-medium truncate max-w-[150px]">{displayCallsign}</span>
      </button>

      <FlightSearchPopover
        isOpen={showSearchPopover}
        onClose={() => setShowSearchPopover(false)}
        buttonRef={searchButtonRef}
        callsign={config.callsign}
        onCallsignChange={(callsign) => onConfigChange({ callsign, lastPosition: null })}
      />
    </>
  );
}
