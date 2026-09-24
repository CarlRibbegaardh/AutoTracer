/**
 * Current, hourly, and daily weather returned by Open-Meteo.
 */
export interface WeatherForecast {
  /** Time zone used for every timestamp in the response. */
  readonly timezone: string;
  /** Current observed conditions. */
  readonly current: {
    readonly time: string;
    readonly temperature_2m: number;
    readonly relative_humidity_2m: number;
    readonly apparent_temperature: number;
    readonly precipitation: number;
    readonly weather_code: number;
    readonly wind_speed_10m: number;
  };
  /** Units for current observed conditions. */
  readonly current_units: {
    readonly temperature_2m: string;
    readonly relative_humidity_2m: string;
    readonly apparent_temperature: string;
    readonly precipitation: string;
    readonly wind_speed_10m: string;
  };
  /** Hourly forecast values. */
  readonly hourly: {
    readonly time: readonly string[];
    readonly temperature_2m: readonly number[];
    readonly precipitation_probability: readonly number[];
    readonly weather_code: readonly number[];
  };
  /** Units for hourly forecast values. */
  readonly hourly_units: {
    readonly temperature_2m: string;
    readonly precipitation_probability: string;
  };
  /** Daily forecast values. */
  readonly daily: {
    readonly time: readonly string[];
    readonly weather_code: readonly number[];
    readonly temperature_2m_max: readonly number[];
    readonly temperature_2m_min: readonly number[];
    readonly precipitation_probability_max: readonly number[];
    readonly wind_speed_10m_max: readonly number[];
  };
  /** Units for daily forecast values. */
  readonly daily_units: {
    readonly temperature_2m_max: string;
    readonly temperature_2m_min: string;
    readonly precipitation_probability_max: string;
    readonly wind_speed_10m_max: string;
  };
}
