import { useState, useCallback } from 'react';

export interface LocationResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface UseLocationSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: LocationResult[];
  isSearching: boolean;
  search: () => Promise<void>;
  clear: () => void;
}

/**
 * Hook for geocoding location search using Nominatim API
 */
export function useLocationSearch(): UseLocationSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
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
  }, [query]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return { query, setQuery, results, isSearching, search, clear };
}

/**
 * Get appropriate zoom level based on location type
 */
export function getZoomForLocationType(type: string): number {
  switch (type) {
    case 'country':
      return 5;
    case 'state':
    case 'administrative':
      return 7;
    case 'city':
    case 'town':
      return 12;
    case 'village':
    case 'suburb':
      return 14;
    default:
      return 10;
  }
}
