'use client'

import { useState, useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface LocationResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface LocationSearchPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onLocationSelect: (lat: number, lon: number, zoom: number, name: string) => void;
  selectedLocationName: string | null;
  onReset: () => void;
}

export function LocationSearchPopover({
  isOpen,
  onClose,
  buttonRef,
  onLocationSelect,
  selectedLocationName,
  onReset,
}: LocationSearchPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useClickOutside(popoverRef, isOpen, onClose);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Update position when popover opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }
  }, [isOpen, buttonRef]);

  const searchLocation = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=en`,
        { headers: { 'User-Agent': 'SituationRoom/1.0' } }
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Location search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (result: LocationResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    // Determine zoom level based on location type
    let zoom = 10;
    if (result.type === 'country') zoom = 5;
    else if (result.type === 'state' || result.type === 'administrative') zoom = 7;
    else if (result.type === 'city' || result.type === 'town') zoom = 12;
    else if (result.type === 'village' || result.type === 'suburb') zoom = 14;

    // Extract location name with fallbacks
    const displayName = result.display_name || '';
    const shortName = displayName.split(',')[0]?.trim() || displayName || 'Unknown Location';

    onLocationSelect(lat, lon, zoom, shortName);
    setQuery('');
    setResults([]);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation();
    } else if (e.key === 'Escape') {
      setResults([]);
      onClose();
    }
  };

  const handleReset = () => {
    onReset();
    setQuery('');
    setResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={popoverRef}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
      }}
      className="bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg p-3"
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[var(--color-muted)]">
          Search Location
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Tokyo, New York, Paris"
            className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          <button
            type="button"
            onClick={searchLocation}
            disabled={isSearching}
            className="px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity flex-shrink-0 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-1 max-h-[200px] overflow-y-auto border border-[var(--color-border)]">
            {results.map((result) => (
              <button
                type="button"
                key={result.place_id}
                onClick={() => handleSelect(result)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-accent)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
              >
                <div className="font-medium truncate">
                  {result.display_name.split(',')[0]}
                </div>
                <div className="text-xs text-[var(--color-muted)] truncate">
                  {result.display_name.split(',').slice(1).join(',').trim()}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedLocationName && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-destructive)] self-start"
          >
            Reset to world view
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
