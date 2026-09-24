import type { WeatherForecast } from "../../../domain/WeatherForecast";

/**
 * Properties for the current weather summary.
 */
export interface CurrentWeatherSummaryProps {
  /** Forecast containing current conditions and units. */
  readonly forecast: WeatherForecast;
}
