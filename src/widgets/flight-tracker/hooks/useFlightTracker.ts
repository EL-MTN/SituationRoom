'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { findFlightByCallsign, getFlightTrack } from '../services';
import type { FlightState, FlightPosition } from '../types';
import { FLIGHT_TRACKER_CONFIG } from '../constants';

interface UseFlightTrackerParams {
  callsign: string;
  pollIntervalMs?: number;
  enabled?: boolean;
}

interface UseFlightTrackerResult {
  flight: FlightState | null;
  trail: FlightPosition[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  dataUpdatedAt: number;
}

export function useFlightTracker({
  callsign,
  pollIntervalMs = FLIGHT_TRACKER_CONFIG.defaults.pollIntervalMs,
  enabled = true,
}: UseFlightTrackerParams): UseFlightTrackerResult {
  const [trail, setTrail] = useState<FlightPosition[]>([]);
  const [historicalTrail, setHistoricalTrail] = useState<FlightPosition[]>([]);
  const lastIcao24Ref = useRef<string | null>(null);

  const query = useQuery<FlightState | null, Error>({
    queryKey: ['flight-tracker', callsign],
    queryFn: async () => {
      if (!callsign.trim()) return null;
      return findFlightByCallsign(callsign);
    },
    enabled: enabled && callsign.trim().length > 0,
    refetchInterval: pollIntervalMs,
    staleTime: pollIntervalMs,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Fetch historical track when we find a new aircraft
  useEffect(() => {
    const icao24 = query.data?.icao24;
    if (icao24 && icao24 !== lastIcao24Ref.current) {
      lastIcao24Ref.current = icao24;
      getFlightTrack(icao24).then((trackData) => {
        if (trackData.length > 0) {
          setHistoricalTrail(trackData);
        }
      });
    }
  }, [query.data?.icao24]);

  // Update live trail when flight data changes
  useEffect(() => {
    if (query.data?.latitude && query.data?.longitude) {
      setTrail((prev) => {
        const newPosition: FlightPosition = {
          latitude: query.data!.latitude,
          longitude: query.data!.longitude,
          altitude: query.data!.altitude,
          timestamp: query.data!.lastUpdated,
        };
        // Keep last N positions for live trail
        const updated = [...prev, newPosition].slice(-FLIGHT_TRACKER_CONFIG.maxTrailLength);
        return updated;
      });
    }
  }, [query.data?.lastUpdated]);

  // Clear trails when callsign changes
  useEffect(() => {
    setTrail([]);
    setHistoricalTrail([]);
    lastIcao24Ref.current = null;
  }, [callsign]);

  // Combine historical and live trails
  const combinedTrail = [...historicalTrail, ...trail];

  return {
    flight: query.data ?? null,
    trail: combinedTrail,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
