import { Box, Stack, Typography } from "@mui/material";
import {
  Air as AirIcon,
  Umbrella as UmbrellaIcon,
  WaterDrop as WaterDropIcon,
  WbSunny as WbSunnyIcon,
} from "@mui/icons-material";
import type { CurrentWeatherSummaryProps } from "../types/CurrentWeatherSummaryProps";
import { WEATHER_LABELS } from "../utils/WEATHER_LABELS";

/**
 * Displays the current weather measurements.
 *
 * @param props - Forecast data to summarize
 * @returns Current conditions display
 */
export const CurrentWeatherSummary = ({
  forecast,
}: CurrentWeatherSummaryProps) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        md: "minmax(240px, 1.4fr) repeat(4, 1fr)",
      },
      gap: 2,
      p: { xs: 2, md: 3 },
      alignItems: "center",
      bgcolor: "background.default",
    }}
  >
    <Box>
      <Typography variant="overline" color="text.secondary">
        Current conditions
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <WbSunnyIcon color="warning" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h3" component="p">
            {forecast.current.temperature_2m}
            {forecast.current_units.temperature_2m}
          </Typography>
          <Typography color="text.secondary">
            {WEATHER_LABELS[forecast.current.weather_code] ??
              "Unknown conditions"}
          </Typography>
        </Box>
      </Stack>
    </Box>
    <Stack direction="row" spacing={1.25} alignItems="center">
      <WbSunnyIcon color="action" />
      <Box>
        <Typography variant="caption" color="text.secondary">
          Feels like
        </Typography>
        <Typography variant="h6">
          {forecast.current.apparent_temperature}
          {forecast.current_units.apparent_temperature}
        </Typography>
      </Box>
    </Stack>
    <Stack direction="row" spacing={1.25} alignItems="center">
      <WaterDropIcon color="info" />
      <Box>
        <Typography variant="caption" color="text.secondary">
          Humidity
        </Typography>
        <Typography variant="h6">
          {forecast.current.relative_humidity_2m}
          {forecast.current_units.relative_humidity_2m}
        </Typography>
      </Box>
    </Stack>
    <Stack direction="row" spacing={1.25} alignItems="center">
      <UmbrellaIcon color="action" />
      <Box>
        <Typography variant="caption" color="text.secondary">
          Precipitation
        </Typography>
        <Typography variant="h6">
          {forecast.current.precipitation}{" "}
          {forecast.current_units.precipitation}
        </Typography>
      </Box>
    </Stack>
    <Stack direction="row" spacing={1.25} alignItems="center">
      <AirIcon color="action" />
      <Box>
        <Typography variant="caption" color="text.secondary">
          Wind
        </Typography>
        <Typography variant="h6">
          {forecast.current.wind_speed_10m}{" "}
          {forecast.current_units.wind_speed_10m}
        </Typography>
      </Box>
    </Stack>
  </Box>
);
