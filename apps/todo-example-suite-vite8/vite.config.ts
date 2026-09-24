import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";
import { flowTracer } from "@autotracer/plugin-vite-flow";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@autotracer/flow/runtime": path.resolve(
        __dirname,
        "../../packages/auto-tracer-flow/dist/runtime.js",
      ),
      "@autotracer/flow": path.resolve(
        __dirname,
        "../../packages/auto-tracer-flow",
      ),
      "@autotracer/logger": path.resolve(
        __dirname,
        "../../packages/auto-tracer-logger",
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
    }),
    flowTracer({
      enabled: true,
      runtimeControlled: false,
      include: {
        paths: ["**/src/**"],
      },
      exclude: {
        paths: ["**/*.test.*", "**/*.spec.*"],
      },
    }),
    react(),
  ],
  server: {
    port: 5204,
    strictPort: true,
  },
  preview: {
    port: 5204,
    strictPort: true,
  },
});
