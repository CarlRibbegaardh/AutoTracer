import type { Place } from "../../../domain/Place";
import type { WeatherForecast } from "../../../domain/WeatherForecast";

/**
 * Properties for the loaded weather data panel.
 */
export interface WeatherDataPanelProps {
  /** Loaded current and forecast weather. */
  readonly forecast: WeatherForecast;
  /** Place represented by the loaded weather. */
  readonly selectedPlace: Place | null;
  /** Index of the selected weather tab. */
  readonly activeTab: number;
  /** Time when the latest weather request completed. */
  readonly lastUpdatedAt: Date | null;
  /** Whether a weather update is in progress. */
  readonly isUpdating: boolean;
  /** Handles weather tab selection. */
  readonly onTabChange: (
    event: React.SyntheticEvent,
    value: number,
  ) => void;
}
