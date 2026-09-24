import {
  Box,
  Divider,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import type { WeatherDataPanelProps } from "../types/WeatherDataPanelProps";
import { formatPlaceLabel } from "../utils/formatPlaceLabel";
import { CurrentWeatherSummary } from "./CurrentWeatherSummary";
import { ForecastWeatherTable } from "./ForecastWeatherTable";
import { TodayWeatherTable } from "./TodayWeatherTable";

/**
 * Composes current conditions and tabbed forecast tables.
 *
 * @param props - Loaded weather, selection state, and tab handler
 * @returns Loaded weather panel
 */
export const WeatherDataPanel = ({
  forecast,
  selectedPlace,
  activeTab,
  lastUpdatedAt,
  isUpdating,
  onTabChange,
}: WeatherDataPanelProps) => (
  <Paper variant="outlined" sx={{ overflow: "hidden" }} aria-busy={isUpdating}>
    <CurrentWeatherSummary forecast={forecast} />
    <Divider />
    <Box sx={{ px: { xs: 1, md: 2 } }}>
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        aria-label="Weather views"
      >
        <Tab
          label="Today"
          id="weather-tab-0"
          aria-controls="weather-panel-0"
        />
        <Tab
          label="Forecast"
          id="weather-tab-1"
          aria-controls="weather-panel-1"
        />
      </Tabs>
    </Box>
    <Divider />
    <TodayWeatherTable forecast={forecast} isVisible={activeTab === 0} />
    <ForecastWeatherTable forecast={forecast} isVisible={activeTab === 1} />
    <Divider />
    <Box sx={{ px: 3, py: 1.5, minHeight: 48 }}>
      <Typography variant="caption" color="text.secondary">
        {lastUpdatedAt === null
          ? "Weather loaded"
          : `Updated ${lastUpdatedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
        {selectedPlace === null ? "" : ` · ${formatPlaceLabel(selectedPlace)}`}
      </Typography>
    </Box>
  </Paper>
);
