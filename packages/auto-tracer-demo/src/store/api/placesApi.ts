import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PlaceSearchResponse } from "../../domain/PlaceSearchResponse";

/**
 * Open-Meteo geocoding API used by the weather station place search.
 */
export const placesApi = createApi({
  reducerPath: "placesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://geocoding-api.open-meteo.com/v1",
  }),
  endpoints: (builder) => ({
    searchPlaces: builder.query<PlaceSearchResponse, string>({
      query: (name) => ({
        url: "/search",
        params: {
          name,
          count: 8,
          language: "en",
          format: "json",
        },
      }),
    }),
  }),
});
