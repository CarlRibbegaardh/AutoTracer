import { defineConfig } from "vite";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig({
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
      labelHooksPattern: "^use[A-Z].*",
      dashboardConfig: {},
    }),
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
