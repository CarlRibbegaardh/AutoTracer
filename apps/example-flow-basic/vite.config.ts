import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { flowTracer } from "@autotracer/plugin-vite-flow";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@autotracer/dashboard": path.resolve(
        __dirname,
        "../../packages/auto-tracer-dashboard",
      ),
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
    flowTracer({
      enabled: true,
      runtimeControlled: true, // Start dormant - activate with startFlowTracing()
      outputMode: "copy-paste",
      tracerName: "__flowTracer",
      logExceptions: true,
      exceptionLogLevel: "debug",
      // Test filtering: only instrument event handlers and math functions
      include: {
        paths: ["**/src/**"], // Only instrument our source files
        functions: ["*", "handle*", "add", "subtract", "multiply", "divide"],
      },
      exclude: {
        functions: ["handleError"], // Skip error handler as a test
      },
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
    port: 5180,
    strictPort: true,
  },
  preview: {
    port: 5180,
    strictPort: true,
  },
});
