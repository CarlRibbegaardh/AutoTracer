import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { ForecastWeatherTableProps } from "../types/ForecastWeatherTableProps";
import { WEATHER_LABELS } from "../utils/WEATHER_LABELS";

/**
 * Displays the seven-day weather forecast.
 *
 * @param props - Forecast data and tab visibility
 * @returns Daily forecast tab panel
 */
export const ForecastWeatherTable = ({
  forecast,
  isVisible,
}: ForecastWeatherTableProps) => (
  <Box
    role="tabpanel"
    id="weather-panel-1"
    aria-labelledby="weather-tab-1"
    hidden={!isVisible}
  >
    <TableContainer sx={{ minHeight: 420 }}>
      <Table aria-label="Seven day weather forecast">
        <TableHead>
          <TableRow>
            <TableCell>Day</TableCell>
            <TableCell>Conditions</TableCell>
            <TableCell align="right">High / Low</TableCell>
            <TableCell align="right">Precipitation</TableCell>
            <TableCell align="right">Max wind</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forecast.daily.time.map((date, index) => (
            <TableRow key={date}>
              <TableCell>
                {new Date(`${date}T12:00:00`).toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell>
                {WEATHER_LABELS[forecast.daily.weather_code[index] ?? -1] ??
                  "Unknown"}
              </TableCell>
              <TableCell align="right">
                {forecast.daily.temperature_2m_max[index]} /{" "}
                {forecast.daily.temperature_2m_min[index]}
                {forecast.daily_units.temperature_2m_max}
              </TableCell>
              <TableCell align="right">
                {forecast.daily.precipitation_probability_max[index]}
                {forecast.daily_units.precipitation_probability_max}
              </TableCell>
              <TableCell align="right">
                {forecast.daily.wind_speed_10m_max[index]}{" "}
                {forecast.daily_units.wind_speed_10m_max}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);
