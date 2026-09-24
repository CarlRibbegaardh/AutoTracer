import type { Place } from "../../../domain/Place";

/**
 * Formats a geocoding result for display in the place picker.
 *
 * @param place - Geocoding result to label
 * @returns Place, administrative area, and country without empty segments
 */
export const formatPlaceLabel = (place: Place): string =>
  [place.name, place.admin1, place.country].filter(Boolean).join(", ");
