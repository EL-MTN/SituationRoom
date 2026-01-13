import type {
  OpenSkyStatesResponse,
  OpenSkyStateArray,
  FlightState,
  FlightPosition,
  OpenSkyTrackResponse,
} from '../types';

const OPENSKY_API = 'https://opensky-network.org/api';

/**
 * Fetch all aircraft states from OpenSky Network
 */
export async function getAllStates(): Promise<OpenSkyStatesResponse> {
  const response = await fetch(`${OPENSKY_API}/states/all`);
  if (!response.ok) {
    throw new Error(`OpenSky API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Find a flight by callsign (case-insensitive substring match)
 */
export async function findFlightByCallsign(callsign: string): Promise<FlightState | null> {
  const data = await getAllStates();
  if (!data.states) return null;

  const normalizedSearch = callsign.trim().toUpperCase();

  for (const state of data.states) {
    const stateCallsign = state[1]?.trim().toUpperCase();
    if (stateCallsign && stateCallsign.includes(normalizedSearch)) {
      // Only return if we have position data
      if (state[5] !== null && state[6] !== null) {
        return parseStateVector(state);
      }
    }
  }
  return null;
}

/**
 * Fetch historical track for an aircraft by ICAO24 code
 */
export async function getFlightTrack(icao24: string): Promise<FlightPosition[]> {
  try {
    const response = await fetch(`${OPENSKY_API}/tracks/all?icao24=${icao24.toLowerCase()}&time=0`);
    if (!response.ok) {
      // Track endpoint may fail for various reasons (rate limit, no data, etc.)
      return [];
    }
    const data: OpenSkyTrackResponse = await response.json();
    if (!data.path || data.path.length === 0) {
      return [];
    }

    return data.path
      .filter((wp) => wp[1] !== null && wp[2] !== null)
      .map((wp) => ({
        latitude: wp[1] as number,
        longitude: wp[2] as number,
        altitude: wp[3] ? Math.round(wp[3] * 3.28084) : 0, // meters to feet
        timestamp: new Date(wp[0] * 1000),
      }));
  } catch {
    // Silently fail - track data is optional
    return [];
  }
}

/**
 * Parse raw OpenSky state vector array into normalized FlightState
 */
function parseStateVector(state: OpenSkyStateArray): FlightState {
  const velocity = state[9];
  const altitude = state[7];
  const verticalRate = state[11];

  return {
    icao24: state[0],
    callsign: (state[1] || '').trim(),
    originCountry: state[2],
    longitude: state[5] as number,
    latitude: state[6] as number,
    altitude: altitude ? Math.round(altitude * 3.28084) : 0, // meters to feet
    groundSpeed: velocity ? Math.round(velocity * 1.94384) : 0, // m/s to knots
    heading: state[10] || 0,
    verticalRate: verticalRate ? Math.round(verticalRate * 196.85) : 0, // m/s to ft/min
    onGround: state[8],
    lastUpdated: new Date(state[4] * 1000),
  };
}
