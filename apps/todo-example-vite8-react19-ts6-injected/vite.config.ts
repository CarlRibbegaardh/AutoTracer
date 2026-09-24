import { reactTracer } from "@autotracer/plugin-vite-react19";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactTracer.vite({
      inject: true,
      mode: "opt-out",
      importSource: "@autotracer/react19",
      include: {
        paths: ["src/**/*.tsx"],
      },
      exclude: {
        paths: [
          "**/*.test.*",
          "**/*.spec.*",
          "**/node_modules/**",
          "**/dist/**",
        ],
      },
      labelHooks: ["useState"],
      outputMode: "copy-paste",
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
    port: 5207,
    strictPort: true,
  },
  preview: {
    port: 5207,
    strictPort: true,
  },
});
