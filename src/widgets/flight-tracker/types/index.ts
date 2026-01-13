import type { BaseWidgetConfig } from '../../registry';

/**
 * OpenSky Network API types
 * https://openskynetwork.github.io/opensky-api/rest.html
 */

/**
 * OpenSky API response for /states/all endpoint
 */
export interface OpenSkyStatesResponse {
  /** Unix timestamp of the state vectors */
  time: number;
  /** Array of state vectors (as tuples) - null if no states */
  states: OpenSkyStateArray[] | null;
}

/**
 * Raw state vector array from OpenSky API
 * Index mapping:
 * [0] icao24, [1] callsign, [2] origin_country, [3] time_position,
 * [4] last_contact, [5] longitude, [6] latitude, [7] baro_altitude,
 * [8] on_ground, [9] velocity, [10] true_track, [11] vertical_rate,
 * [12] sensors, [13] geo_altitude, [14] squawk, [15] spi, [16] position_source
 */
export type OpenSkyStateArray = [
  string, // icao24
  string | null, // callsign
  string, // origin_country
  number | null, // time_position
  number, // last_contact
  number | null, // longitude
  number | null, // latitude
  number | null, // baro_altitude
  boolean, // on_ground
  number | null, // velocity
  number | null, // true_track
  number | null, // vertical_rate
  number[] | null, // sensors
  number | null, // geo_altitude
  string | null, // squawk
  boolean, // spi
  number, // position_source
];

/**
 * Normalized flight data for easier consumption
 */
export interface FlightState {
  /** ICAO24 transponder address (hex) */
  icao24: string;
  /** Flight callsign (trimmed) */
  callsign: string;
  /** Country of origin */
  originCountry: string;
  /** Longitude in decimal degrees */
  longitude: number;
  /** Latitude in decimal degrees */
  latitude: number;
  /** Altitude in feet */
  altitude: number;
  /** Ground speed in knots */
  groundSpeed: number;
  /** Heading in degrees (0-360) */
  heading: number;
  /** Vertical rate in feet per minute */
  verticalRate: number;
  /** Whether aircraft is on the ground */
  onGround: boolean;
  /** Last update timestamp */
  lastUpdated: Date;
}

/**
 * Flight position for trail history
 */
export interface FlightPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: Date;
}

/**
 * OpenSky track waypoint from /tracks/all endpoint
 * Array format: [time, latitude, longitude, baro_altitude, true_track, on_ground]
 */
export type OpenSkyTrackWaypoint = [
  number, // time (Unix timestamp)
  number | null, // latitude
  number | null, // longitude
  number | null, // baro_altitude (meters)
  number | null, // true_track (heading)
  boolean, // on_ground
];

/**
 * OpenSky API response for /tracks/all endpoint
 */
export interface OpenSkyTrackResponse {
  icao24: string;
  callsign: string | null;
  startTime: number;
  endTime: number;
  path: OpenSkyTrackWaypoint[];
}

/** Widget configuration */
export interface FlightTrackerWidgetConfig extends BaseWidgetConfig {
  type: 'flight-tracker';
  /** Flight callsign to track (e.g., "UAL123", "DLH456") */
  callsign: string;
  /** Polling interval in milliseconds */
  pollIntervalMs: number;
  /** Show flight trail/history */
  showTrail: boolean;
  /** Auto-center map on aircraft */
  autoCenter: boolean;
  /** Map zoom level */
  zoom: number;
  /** Last known position for map centering */
  lastPosition: [number, number] | null;
}
