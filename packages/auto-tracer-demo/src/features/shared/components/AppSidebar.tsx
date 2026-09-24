import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import type { NavItem } from "../types/NavItem";
import { DRAWER_WIDTH } from "../utils/constants";

/**
 * Properties for the AppSidebar component
 */
export interface AppSidebarProps {
  /**
   * Whether the sidebar is currently open
   */
  readonly open: boolean;

  /**
   * Array of navigation items to display
   */
  readonly navItems: readonly NavItem[];

  /**
   * Current route path
   */
  readonly currentPath: string;

  /**
   * Handler called when a navigation item is clicked
   */
  readonly onNavigate: (path: string) => void;
}

/**
 * Application sidebar navigation drawer
 *
 * @param props - Sidebar configuration and handlers
 * @returns Material-UI Drawer component with navigation items
 */
export const AppSidebar = ({
  open,
  navItems,
  currentPath,
  onNavigate,
}: AppSidebarProps) => (
  <Drawer
    variant="persistent"
    open={open}
    sx={{
      width: open ? DRAWER_WIDTH : 0,
      flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
      },
    }}
  >
    <Toolbar />
    <Box sx={{ overflow: "auto" }}>
      <List>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => onNavigate(item.path)}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  </Drawer>
);
