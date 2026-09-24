import type { Place } from "../../../domain/Place";

/**
 * Properties for the weather place search and update controls.
 */
export interface WeatherSearchPanelProps {
  /** Current text in the place search field. */
  readonly searchText: string;
  /** Debounced text currently used for place search. */
  readonly debouncedSearchText: string;
  /** Places available for selection. */
  readonly places: readonly Place[];
  /** Currently selected place. */
  readonly selectedPlace: Place | null;
  /** Whether place search is in progress. */
  readonly isSearching: boolean;
  /** Whether weather is being updated. */
  readonly isUpdating: boolean;
  /** Handles place selection changes. */
  readonly onPlaceChange: (
    event: React.SyntheticEvent,
    place: Place | null,
  ) => void;
  /** Handles place search text changes. */
  readonly onSearchTextChange: (
    event: React.SyntheticEvent,
    value: string,
  ) => void;
  /** Requests weather for the selected place. */
  readonly onUpdateWeather: () => Promise<void>;
}
