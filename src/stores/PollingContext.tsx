'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Query keys that support polling - used for refreshAll
const POLLING_QUERY_KEYS = [
  'gdelt-doc',
  'gdelt-geo',
  'flight-tracker',
  'bluesky-feed',
  'polymarket-event',
  'polymarket-price-history',
];

// Widget status for connection tracking
export interface WidgetStatus {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  lastUpdated?: number;
}

// Connection status types
export type ConnectionStatus = 'idle' | 'loading' | 'connected' | 'partial' | 'error';

// Context value
interface PollingContextValue {
  // Pause state
  isPaused: boolean;
  pauseAll: () => void;
  resumeAll: () => void;
  togglePause: () => void;

  // Refresh state
  isRefreshing: boolean;
  refreshAll: () => Promise<void>;

  // Connection status
  connectionStatus: ConnectionStatus;
  widgetStatuses: Map<string, WidgetStatus>;
  registerWidget: (widgetId: string, status: WidgetStatus) => void;
  unregisterWidget: (widgetId: string) => void;
}

const PollingContext = createContext<PollingContextValue | null>(null);

export function PollingProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Pause state
  const [isPaused, setIsPaused] = useState(false);

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Widget status tracking
  const [widgetStatuses, setWidgetStatuses] = useState<Map<string, WidgetStatus>>(new Map());

  // Pause controls
  const pauseAll = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeAll = useCallback(() => {
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Refresh all polling queries
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey[0] as string;
          return POLLING_QUERY_KEYS.includes(key);
        },
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  // Widget registration for status tracking
  const registerWidget = useCallback((widgetId: string, status: WidgetStatus) => {
    setWidgetStatuses((prev) => {
      const next = new Map(prev);
      next.set(widgetId, status);
      return next;
    });
  }, []);

  const unregisterWidget = useCallback((widgetId: string) => {
    setWidgetStatuses((prev) => {
      const next = new Map(prev);
      next.delete(widgetId);
      return next;
    });
  }, []);

  // Derive connection status from widget statuses
  const connectionStatus = useMemo<ConnectionStatus>(() => {
    const statuses = Array.from(widgetStatuses.values());

    if (statuses.length === 0) return 'idle';
    if (statuses.some((s) => s.isLoading)) return 'loading';

    const errorCount = statuses.filter((s) => s.hasError).length;
    if (errorCount === statuses.length) return 'error';
    if (errorCount > 0) return 'partial';

    return 'connected';
  }, [widgetStatuses]);

  const value: PollingContextValue = {
    isPaused,
    pauseAll,
    resumeAll,
    togglePause,
    isRefreshing,
    refreshAll,
    connectionStatus,
    widgetStatuses,
    registerWidget,
    unregisterWidget,
  };

  return <PollingContext.Provider value={value}>{children}</PollingContext.Provider>;
}

// Hook to access polling context
export function usePolling() {
  const context = useContext(PollingContext);
  if (!context) {
    throw new Error('usePolling must be used within a PollingProvider');
  }
  return context;
}

// Hook for widgets to register their status and get pause state
export function usePollingStatus(
  widgetId: string,
  status: { isLoading: boolean; error: Error | null; dataUpdatedAt?: number }
) {
  const { isPaused, registerWidget, unregisterWidget } = usePolling();

  useEffect(() => {
    registerWidget(widgetId, {
      isLoading: status.isLoading,
      hasError: !!status.error,
      errorMessage: status.error?.message,
      lastUpdated: status.dataUpdatedAt,
    });

    return () => {
      unregisterWidget(widgetId);
    };
  }, [widgetId, status.isLoading, status.error, status.dataUpdatedAt, registerWidget, unregisterWidget]);

  return { isPaused };
}
