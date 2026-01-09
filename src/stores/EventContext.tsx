import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { EventSelection } from '../types';

interface EventContextValue {
  selectedEvent: EventSelection;
  selectEvent: (eventId: string | null, source: 'event-feed') => void;
}

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({ children }: { children: ReactNode }) {
  const [selectedEvent, setSelectedEvent] = useState<EventSelection>({
    eventId: null,
    source: null,
    timestamp: 0,
  });

  const selectEvent = useCallback((eventId: string | null, source: 'event-feed') => {
    setSelectedEvent({
      eventId,
      source,
      timestamp: Date.now(),
    });
  }, []);

  const value: EventContextValue = {
    selectedEvent,
    selectEvent,
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
