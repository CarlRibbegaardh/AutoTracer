import { Box, Toolbar } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector, toggleTheme, toggleSidebar } from "../../../store";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { NAV_ITEMS } from "../utils/navConfig";

/**
 * Properties for the AppLayout component
 */
export interface AppLayoutProps {
  /**
   * Child components to render in the main content area
   */
  readonly children: React.ReactNode;
}

/**
 * Main application layout with header, sidebar, and content area
 *
 * @param props - Layout configuration
 * @returns Complete application shell with navigation
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const themeMode = useAppSelector((state) => state.ui.themeMode);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppHeader
        themeMode={themeMode}
        onToggleSidebar={handleToggleSidebar}
        onToggleTheme={handleToggleTheme}
      />

      <AppSidebar
        open={sidebarOpen}
        navItems={NAV_ITEMS}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 3,
          transition: (theme) =>
            theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: sidebarOpen
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
