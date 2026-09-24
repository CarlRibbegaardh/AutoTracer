import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
      // Also enable pattern matching for custom hooks
      labelHooksPattern: "^use[A-Z].*",
      // Enable automatic UMD loading for production builds with workspace libraries
      buildWithWorkspaceLibs: mode === "production",
    }),
    react(),
  ],
  server: {
    port: 5182,
    strictPort: true,
  },
  preview: {
    port: 5182,
    strictPort: true,
  },
}));
