import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Place } from "../../domain/Place";
import type { WeatherForecast } from "../../domain/WeatherForecast";

/**
 * Open-Meteo forecast API used by the weather station display.
 */
export const weatherApi = createApi({
  reducerPath: "weatherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.open-meteo.com/v1",
  }),
  endpoints: (builder) => ({
    getWeather: builder.query<WeatherForecast, Place>({
      query: ({ latitude, longitude }) => ({
        url: "/forecast",
        params: {
          latitude,
          longitude,
          current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "weather_code",
            "wind_speed_10m",
          ].join(","),
          hourly: [
            "temperature_2m",
            "precipitation_probability",
            "weather_code",
          ].join(","),
          daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
            "wind_speed_10m_max",
          ].join(","),
          timezone: "auto",
          forecast_hours: 24,
          forecast_days: 7,
        },
      }),
    }),
  }),
});
