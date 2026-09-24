import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@autotracer/dashboard": path.resolve(
        __dirname,
        "../../packages/auto-tracer-dashboard",
      ),
    },
  },
  plugins: [
    reactTracer.vite({
      mode: "opt-out",
      importSource: "@autotracer/react18",
      include: {
        paths: ["src/**/*.tsx"],
      },
      exclude: {
        paths: ["**/*.test.*", "**/*.spec.*"],
      },
      labelHooks: ["useState", "useReducer", "useSelector"],
      labelHooksPattern: "^use[A-Z].*",
      // Dashboard widget configuration
      dashboardConfig: {
        enabled: true,
        hideByDefault: false,
        position: "bottom-right",
        hotkeys: {
          toggleTracing: "Alt+Shift+T",
          toggleDashboard: "Alt+Shift+D",
        },
      },
    }),
    react(),
  ],
  server: {
    port: 5200,
    strictPort: true,
  },
  preview: {
    port: 5200,
    strictPort: true,
  },
});
