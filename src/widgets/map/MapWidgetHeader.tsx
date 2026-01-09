import { useState, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { LocationSearchPopover } from './LocationSearchPopover';
import type { WidgetHeaderExtensionProps } from '../registry';
import type { MapWidgetConfig } from './MapWidget.types';

export function MapWidgetHeader({
  onConfigChange,
}: WidgetHeaderExtensionProps<MapWidgetConfig>) {
  const [showLocationPopover, setShowLocationPopover] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);

  const handleLocationSelect = (lat: number, lon: number, zoom: number, name: string) => {
    onConfigChange({ center: [lat, lon], zoom });
    setSelectedLocationName(name);
  };

  const handleLocationReset = () => {
    onConfigChange({ center: [20, 0], zoom: 2 });
    setSelectedLocationName(null);
  };

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
          selectedLocationName
            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
            : 'hover:bg-[var(--color-accent)] text-[var(--color-muted)]'
        }`}
        title="Search location"
      >
        <MapPin className="w-4 h-4" />
        <span className="font-medium truncate max-w-[150px]">
          {selectedLocationName || 'Search location...'}
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
