import { useState, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { LocationSearchPopover } from './LocationSearchPopover';
import type { WidgetHeaderExtensionProps } from '../registry';
import type { MapWidgetConfig } from './MapWidget.types';

export function MapWidgetHeader({
  config,
  onConfigChange,
}: WidgetHeaderExtensionProps<MapWidgetConfig>) {
  const [showLocationPopover, setShowLocationPopover] = useState(false);
  const locationButtonRef = useRef<HTMLButtonElement>(null);

  // Safely get location name, ensuring it's a valid string or null
  const selectedLocationName = config.locationName && typeof config.locationName === 'string'
    ? config.locationName
    : null;

  const handleLocationSelect = (lat: number, lon: number, zoom: number, name: string) => {
    if (name && typeof name === 'string') {
      onConfigChange({ center: [lat, lon], zoom, locationName: name });
    }
  };

  const handleLocationReset = () => {
    onConfigChange({ center: [20, 0], zoom: 2, locationName: null });
  };

  const displayName = selectedLocationName || 'Search location...';
  const hasLocation = Boolean(selectedLocationName);

  return (
    <>
      <button
        ref={locationButtonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowLocationPopover(!showLocationPopover);
        }}
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
          hasLocation
            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
            : 'hover:bg-[var(--color-accent)] text-[var(--color-muted)]'
        }`}
        title="Search location"
      >
        <MapPin className="w-4 h-4" />
        <span className="font-medium truncate max-w-[150px]">
          {displayName}
        </span>
      </button>

      <LocationSearchPopover
        isOpen={showLocationPopover}
        onClose={() => setShowLocationPopover(false)}
        buttonRef={locationButtonRef}
        onLocationSelect={handleLocationSelect}
        selectedLocationName={selectedLocationName}
        onReset={handleLocationReset}
      />
    </>
  );
}
