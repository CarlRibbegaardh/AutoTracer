import {
  Dashboard as DashboardIcon,
  HomeOutlined as HomeIcon,
  Science as ScienceIcon,
  Task as TaskIcon,
  Thunderstorm as ThunderstormIcon,
} from "@mui/icons-material";
import type { NavItem } from "../types/NavItem";

/**
 * Application navigation menu configuration
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: "/", label: "Start", icon: HomeIcon },
  { path: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { path: "/trace-lab", label: "Trace Lab", icon: ScienceIcon },
  { path: "/tasks", label: "Tasks", icon: TaskIcon },
  { path: "/weather", label: "Weather Station", icon: ThunderstormIcon },
] as const;
