import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";

/**
 * Properties for the AppHeader component
 */
export interface AppHeaderProps {
  /**
   * Current theme mode (light or dark)
   */
  readonly themeMode: "light" | "dark";

  /**
   * Handler for sidebar toggle button
   */
  readonly onToggleSidebar: () => void;

  /**
   * Handler for theme toggle button
   */
  readonly onToggleTheme: () => void;

}

/**
 * Application header bar with tracing controls and theme toggle
 *
 * @param props - Header configuration and handlers
 * @returns Material-UI AppBar component
 */
export const AppHeader = ({
  themeMode,
  onToggleSidebar,
  onToggleTheme,
}: AppHeaderProps) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          ReactTracer Demo
        </Typography>
        <IconButton
          aria-label="toggle theme"
          color="inherit"
          onClick={onToggleTheme}
        >
          {themeMode === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
