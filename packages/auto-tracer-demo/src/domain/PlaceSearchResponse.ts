import type { Place } from "./Place";

/**
 * Search results returned by the Open-Meteo geocoding service.
 */
export interface PlaceSearchResponse {
  /** Matching places, omitted when no place matches. */
  readonly results?: readonly Place[];
}
