import type { WeatherForecast } from "../../../domain/WeatherForecast";

/**
 * Properties for the daily forecast table.
 */
export interface ForecastWeatherTableProps {
  /** Forecast containing daily values and units. */
  readonly forecast: WeatherForecast;
  /** Whether the Forecast tab is selected. */
  readonly isVisible: boolean;
}
