import { useState, useRef } from 'react';
import { Settings, X, RefreshCw, GripVertical, Search, MapPin } from 'lucide-react';
import { LocationSearchPopover } from './LocationSearchPopover';
import { EventFeedSearchPopover } from './EventFeedSearchPopover';
import { SettingsPopover } from './SettingsPopover';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import type { WidgetConfig, EventFeedWidgetConfig } from '../types';

interface WidgetWrapperProps {
  config: WidgetConfig;
  onRemove: () => void;
  onConfigChange: (config: Partial<WidgetConfig>) => void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
  children: React.ReactNode;
}

export function WidgetWrapper({
  config,
  onRemove,
  onConfigChange,
  isLoading,
  lastUpdated,
  children,
}: WidgetWrapperProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const [showLocationPopover, setShowLocationPopover] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);

  const isEventFeed = config.type === 'event-feed';
  const isMap = config.type === 'map';
  const eventFeedConfig = isEventFeed ? (config as EventFeedWidgetConfig) : null;

  const handleLocationSelect = (lat: number, lon: number, zoom: number, name: string) => {
    onConfigChange({ center: [lat, lon], zoom } as Partial<WidgetConfig>);
    setSelectedLocationName(name);
  };

  const handleLocationReset = () => {
    onConfigChange({ center: [20, 0], zoom: 2 } as Partial<WidgetConfig>);
    setSelectedLocationName(null);
  };

  return (
    <div className="h-full flex flex-col bg-(--color-background) border border-(--color-border) rounded-lg shadow-sm">
      {/* Header */}
      <div className="relative flex items-center justify-between px-3 py-2 border-b border-(--color-border) bg-(--color-accent)/50 overflow-visible z-20">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <span className="widget-drag-handle cursor-grab">
            <GripVertical className="w-4 h-4 text-(--color-muted)" />
          </span>

          {isEventFeed && eventFeedConfig ? (
            <button
              onClick={() => setShowSearchPopover(!showSearchPopover)}
              onMouseDown={(e) => e.stopPropagation()}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
                eventFeedConfig.filters.query
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'hover:bg-[var(--color-accent)] text-[var(--color-muted)]'
              }`}
              title="Search events"
            >
              <Search className="w-4 h-4" />
              {eventFeedConfig.filters.query && (
                <span className="font-medium truncate max-w-[120px]">
                  {eventFeedConfig.filters.query}
                </span>
              )}
            </button>
          ) : isMap ? (
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
          ) : (
            <span
              className="font-medium text-sm"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {config.title}
            </span>
          )}

          {isLoading && (
            <RefreshCw className="w-3 h-3 text-(--color-primary) animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
          {lastUpdated && (
            <span className="text-xs text-(--color-muted) mr-2">
              {formatRelativeTime(lastUpdated)}
            </span>
          )}

          {isEventFeed && eventFeedConfig && (
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 rounded hover:bg-(--color-accent) transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4 text-(--color-muted)" />
              </button>
              <SettingsPopover
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                config={eventFeedConfig}
                onConfigChange={onConfigChange}
              />
            </div>
          )}

          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-[var(--color-destructive)]/10 transition-colors"
            title="Remove widget"
          >
            <X className="w-4 h-4 text-(--color-muted) hover:text-(--color-destructive)" />
          </button>
        </div>

        {/* Event Feed Search Popover */}
        {isEventFeed && eventFeedConfig && (
          <EventFeedSearchPopover
            isOpen={showSearchPopover}
            onClose={() => setShowSearchPopover(false)}
            config={eventFeedConfig}
            onConfigChange={onConfigChange}
          />
        )}
      </div>

      {/* Location Search Popover (portal-rendered) */}
      {isMap && (
        <LocationSearchPopover
          isOpen={showLocationPopover}
          onClose={() => setShowLocationPopover(false)}
          buttonRef={locationButtonRef}
          onLocationSelect={handleLocationSelect}
          selectedLocationName={selectedLocationName}
          onReset={handleLocationReset}
        />
      )}

      {/* Content */}
      <div
        className="flex-1 overflow-hidden min-h-0 rounded-b-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
