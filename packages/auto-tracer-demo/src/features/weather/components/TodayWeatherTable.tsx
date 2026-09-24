import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { TodayWeatherTableProps } from "../types/TodayWeatherTableProps";
import { WEATHER_LABELS } from "../utils/WEATHER_LABELS";

/**
 * Displays the next 24 hours of weather.
 *
 * @param props - Forecast data and tab visibility
 * @returns Hourly forecast tab panel
 */
export const TodayWeatherTable = ({
  forecast,
  isVisible,
}: TodayWeatherTableProps) => (
  <Box
    role="tabpanel"
    id="weather-panel-0"
    aria-labelledby="weather-tab-0"
    hidden={!isVisible}
  >
    <TableContainer sx={{ minHeight: 420 }}>
      <Table aria-label="Today hourly forecast">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Conditions</TableCell>
            <TableCell align="right">Temperature</TableCell>
            <TableCell align="right">Precipitation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forecast.hourly.time.map((time, index) => (
            <TableRow key={time}>
              <TableCell>
                {new Date(time).toLocaleTimeString([], { hour: "numeric" })}
              </TableCell>
              <TableCell>
                {WEATHER_LABELS[
                  forecast.hourly.weather_code[index] ?? -1
                ] ?? "Unknown"}
              </TableCell>
              <TableCell align="right">
                {forecast.hourly.temperature_2m[index]}
                {forecast.hourly_units.temperature_2m}
              </TableCell>
              <TableCell align="right">
                {forecast.hourly.precipitation_probability[index]}
                {forecast.hourly_units.precipitation_probability}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);