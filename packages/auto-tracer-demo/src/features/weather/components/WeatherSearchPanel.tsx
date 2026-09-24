import {
  Autocomplete,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { formatPlaceLabel } from "../utils/formatPlaceLabel";
import type { WeatherSearchPanelProps } from "../types/WeatherSearchPanelProps";

/**
 * Displays the place search and explicit weather update controls.
 *
 * @param props - Search values, request state, and event handlers
 * @returns Search and update controls
 */
export const WeatherSearchPanel = ({
  searchText,
  debouncedSearchText,
  places,
  selectedPlace,
  isSearching,
  isUpdating,
  onPlaceChange,
  onSearchTextChange,
  onUpdateWeather,
}: WeatherSearchPanelProps) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, mb: 3 }}>
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <Autocomplete
        fullWidth
        options={places}
        value={selectedPlace}
        inputValue={searchText}
        loading={isSearching}
        getOptionLabel={formatPlaceLabel}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText={
          debouncedSearchText.length < 2
            ? "Enter at least two characters"
            : "No matching places"
        }
        onChange={onPlaceChange}
        onInputChange={onSearchTextChange}
        renderInput={(params) => (
          <TextField
            {...params}
            size={params.size ?? "medium"}
            label="Place"
            placeholder="City or town"
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: (
                  <>
                    <SearchIcon color="action" sx={{ mr: 1 }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {isSearching ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
      <Button
        variant="contained"
        startIcon={
          isUpdating ? (
            <CircularProgress color="inherit" size={18} />
          ) : (
            <RefreshIcon />
          )
        }
        disabled={selectedPlace === null || isUpdating}
        onClick={onUpdateWeather}
        sx={{ minWidth: 190, minHeight: 56, whiteSpace: "nowrap" }}
      >
        Update weather
      </Button>
    </Stack>
    {selectedPlace !== null ? (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {selectedPlace.latitude.toFixed(3)}, {selectedPlace.longitude.toFixed(3)} · {selectedPlace.timezone}
      </Typography>
    ) : null}
  </Paper>
);
