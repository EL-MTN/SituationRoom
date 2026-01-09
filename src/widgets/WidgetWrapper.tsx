import { useState, useRef, useEffect } from 'react';
import { Settings, X, RefreshCw, GripVertical, Search } from 'lucide-react';
import type { WidgetConfig } from '../types';

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
  const [searchQuery, setSearchQuery] = useState(config.filters.query || '');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPopoverRef = useRef<HTMLDivElement>(null);
  const settingsPopoverRef = useRef<HTMLDivElement>(null);

  const isEventFeed = config.type === 'event-feed';

  // Focus input when popover opens
  useEffect(() => {
    if (showSearchPopover && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchPopover]);

  // Close search popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchPopoverRef.current && !searchPopoverRef.current.contains(event.target as Node)) {
        setShowSearchPopover(false);
      }
    }
    if (showSearchPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchPopover]);

  // Close settings popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsPopoverRef.current && !settingsPopoverRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettings]);

  // Sync local search state with config
  useEffect(() => {
    setSearchQuery(config.filters.query || '');
  }, [config.filters.query]);

  const handleSearchSubmit = () => {
    onConfigChange({
      filters: { ...config.filters, query: searchQuery },
    } as Partial<WidgetConfig>);
    setShowSearchPopover(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setShowSearchPopover(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-(--color-background) border border-(--color-border) rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="relative flex items-center justify-between px-3 py-2 border-b border-(--color-border) bg-(--color-accent)/50">
        <div className="flex items-center gap-2">
          {/* Grip icon - only element that allows dragging */}
          <span className="cursor-grab">
            <GripVertical className="w-4 h-4 text-(--color-muted)" />
          </span>

          {isEventFeed ? (
            /* Search icon with popover for event feed */
            <button
              onClick={() => setShowSearchPopover(!showSearchPopover)}
              onMouseDown={(e) => e.stopPropagation()}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
                config.filters.query
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'hover:bg-[var(--color-accent)] text-[var(--color-muted)]'
              }`}
              title="Search events"
            >
              <Search className="w-4 h-4" />
              {config.filters.query && (
                <span className="font-medium truncate max-w-[120px]">
                  {config.filters.query}
                </span>
              )}
            </button>
          ) : (
            /* Regular title for other widgets */
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
        <div
          className="flex items-center gap-1"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {lastUpdated && (
            <span className="text-xs text-(--color-muted) mr-2">
              {formatRelativeTime(lastUpdated)}
            </span>
          )}
          {/* Settings button with popover */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 rounded hover:bg-(--color-accent) transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-(--color-muted)" />
            </button>

            {/* Settings Popover */}
            {showSettings && (
              <div
                ref={settingsPopoverRef}
                className="absolute top-full right-0 mt-1 z-50 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg p-3 min-w-[180px]"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[var(--color-muted)]">
                    Time Range
                  </label>
                  <select
                    value={config.filters.timespan || '24h'}
                    onChange={(e) => {
                      onConfigChange({
                        filters: { ...config.filters, timespan: e.target.value },
                      } as Partial<WidgetConfig>);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  >
                    <option value="15min">15 minutes</option>
                    <option value="30min">30 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="3h">3 hours</option>
                    <option value="6h">6 hours</option>
                    <option value="12h">12 hours</option>
                    <option value="24h">24 hours</option>
                    <option value="3d">3 days</option>
                    <option value="7d">7 days</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-[var(--color-destructive)]/10 transition-colors"
            title="Remove widget"
          >
            <X className="w-4 h-4 text-(--color-muted) hover:text-(--color-destructive)" />
          </button>
        </div>

        {/* Search Popover - positioned relative to header */}
        {isEventFeed && showSearchPopover && (
          <div
            ref={searchPopoverRef}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-full left-0 right-0 mx-2 mt-1 z-50 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg p-3"
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[var(--color-muted)]">
                Search Query
              </label>
              <div className="flex gap-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="e.g., ukraine, climate, elections"
                  className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
                <button
                  onClick={handleSearchSubmit}
                  className="px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  Search
                </button>
              </div>
              {config.filters.query && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    onConfigChange({
                      filters: { ...config.filters, query: '' },
                    } as Partial<WidgetConfig>);
                    setShowSearchPopover(false);
                  }}
                  className="text-xs text-[var(--color-muted)] hover:text-[var(--color-destructive)] self-start"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-hidden min-h-0"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}
