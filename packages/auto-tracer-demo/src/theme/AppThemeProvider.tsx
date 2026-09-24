import { useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./theme";
import { useAppSelector } from "../store";

/**
 * Theme provider component
 *
 * Wraps the app with MUI theme based on current mode from Redux store.
 */
export const AppThemeProvider = ({
  children,
}: {
  readonly children: React.ReactNode;
}) => {
  const themeMode = useAppSelector((state) => state.ui.themeMode);
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
