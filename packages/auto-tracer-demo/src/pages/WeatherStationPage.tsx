import { useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import type { Place } from "../domain/Place";
import { placesApi } from "../store/api/placesApi";
import { weatherApi } from "../store/api/weatherApi";
import { useDebouncedValue } from "../features/weather/utils/useDebouncedValue";
import { WeatherDataPanel } from "../features/weather/components/WeatherDataPanel";
import { WeatherEmptyState } from "../features/weather/components/WeatherEmptyState";
import { WeatherSearchPanel } from "../features/weather/components/WeatherSearchPanel";

/**
 * Interactive Open-Meteo weather station with current and forecast views.
 */
export const WeatherStationPage = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const debouncedSearchText = useDebouncedValue(searchText.trim(), 350);
  const placeSearch = placesApi.useSearchPlacesQuery(debouncedSearchText, {
    skip: debouncedSearchText.length < 2,
  });
  const [loadWeather, weather] = weatherApi.useLazyGetWeatherQuery();
  const places = placeSearch.data?.results ?? [];
  const forecast = weather.data;

  /** Updates the selected geocoding result. */
  const handlePlaceChange = (_event: React.SyntheticEvent, place: Place | null) => {
    setSelectedPlace(place);
  };

  /** Updates the text used by the debounced place search. */
  const handleSearchTextChange = (
    _event: React.SyntheticEvent,
    value: string,
  ) => {
    setSearchText(value);
  };

  /** Requests weather for the selected place. */
  const handleUpdateWeather = async (): Promise<void> => {
    if (selectedPlace === null) {
      return;
    }

    const result = await loadWeather(selectedPlace);
    if ("data" in result) {
      setLastUpdatedAt(new Date());
    }
  };

  /** Selects the visible weather time range. */
  const handleTabChange = (_event: React.SyntheticEvent, value: number) => {
    setActiveTab(value);
  };

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 0.75 }}>
          Weather Station
        </Typography>
        <Typography color="text.secondary">
          Search for a place, then request its latest Open-Meteo conditions.
        </Typography>
      </Box>

      <WeatherSearchPanel
        searchText={searchText}
        debouncedSearchText={debouncedSearchText}
        places={places}
        selectedPlace={selectedPlace}
        isSearching={placeSearch.isFetching}
        isUpdating={weather.isFetching}
        onPlaceChange={handlePlaceChange}
        onSearchTextChange={handleSearchTextChange}
        onUpdateWeather={handleUpdateWeather}
      />

      {placeSearch.isError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Place search failed. Check the connection and try again.
        </Alert>
      ) : null}
      {weather.isError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Weather could not be updated. The previous reading is still shown when available.
        </Alert>
      ) : null}

      {forecast === undefined ? (
        <WeatherEmptyState />
      ) : (
        <WeatherDataPanel
          forecast={forecast}
          selectedPlace={selectedPlace}
          activeTab={activeTab}
          lastUpdatedAt={lastUpdatedAt}
          isUpdating={weather.isFetching}
          onTabChange={handleTabChange}
        />
      )}
    </Box>
  );
};
