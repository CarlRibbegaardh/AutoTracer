import type { WeatherForecast } from "../../../domain/WeatherForecast";

/**
 * Properties for the hourly weather table.
 */
export interface TodayWeatherTableProps {
  /** Forecast containing hourly values and units. */
  readonly forecast: WeatherForecast;
  /** Whether the Today tab is selected. */
  readonly isVisible: boolean;
}
