/**
 * A place returned by the Open-Meteo geocoding service.
 */
export interface Place {
  /** Stable geocoding result identifier. */
  readonly id: number;
  /** Display name of the place. */
  readonly name: string;
  /** Latitude in decimal degrees. */
  readonly latitude: number;
  /** Longitude in decimal degrees. */
  readonly longitude: number;
  /** IANA time zone for the place. */
  readonly timezone: string;
  /** Country containing the place. */
  readonly country?: string;
  /** First-level administrative area containing the place. */
  readonly admin1?: string;
}
