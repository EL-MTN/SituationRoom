import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { EventSelection, GeoFocus } from '../types';

interface EventContextValue {
  selectedEvent: EventSelection;
  geoFocus: GeoFocus | null;
  selectEvent: (eventId: string | null, source: 'map' | 'event-feed') => void;
  clearSelection: () => void;
  setGeoFocus: (focus: GeoFocus | null) => void;
}

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({ children }: { children: ReactNode }) {
  const [selectedEvent, setSelectedEvent] = useState<EventSelection>({
    eventId: null,
    source: null,
    timestamp: 0,
  });
  const [geoFocus, setGeoFocusState] = useState<GeoFocus | null>(null);

  const selectEvent = useCallback((eventId: string | null, source: 'map' | 'event-feed') => {
    setSelectedEvent({
      eventId,
      source,
      timestamp: Date.now(),
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEvent({ eventId: null, source: null, timestamp: 0 });
  }, []);

  const setGeoFocus = useCallback((focus: GeoFocus | null) => {
    setGeoFocusState(focus);
  }, []);

  const value: EventContextValue = {
    selectedEvent,
    geoFocus,
    selectEvent,
    clearSelection,
    setGeoFocus,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
