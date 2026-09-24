import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";
import { flowTracer } from "@autotracer/plugin-vite-flow";
import { networkTracer } from "@autotracer/plugin-vite-network";
import path from "path";

// https://vitejs.dev/config/
// @ts-expect-error - pnpm workspace has multiple vite versions; runtime resolution works correctly
export default defineConfig(() => ({
  resolve: {
    alias: {
      "@autotracer/react18": path.resolve(
        __dirname,
        "node_modules/@autotracer/react18",
      ),
      "@autotracer/flow/runtime": path.resolve(
        __dirname,
        "node_modules/@autotracer/flow/dist/runtime.js",
      ),
      "@autotracer/flow": path.resolve(
        __dirname,
        "node_modules/@autotracer/flow",
      ),
      "@autotracer/logger": path.resolve(
        __dirname,
        "node_modules/@autotracer/logger",
      ),
      "@autotracer/network": path.resolve(
        __dirname,
        "node_modules/@autotracer/network",
      ),
      "@autotracer/dashboard": path.resolve(
        __dirname,
        "node_modules/@autotracer/dashboard",
      ),
    },
  },
  plugins: [
    reactTracer.vite({
      inject: true, // This is enabled always to demo the logging on a public site. This is normally not recommended.
      dashboardConfig: {},
    }),
    flowTracer({
      inject: true, // This is enabled always to demo the logging on a public site. This is normally not recommended.
      runtimeControlled: true,
      include: {
        paths: ["**/src/**"], // Only instrument our source files
      },
      dashboardConfig: {},
    }),
    networkTracer.vite({
      inject: true, // The public demo includes every tracer so visitors can try the complete system.
      dashboardConfig: {},
    }),

    react(),
  ],
  server: {
    port: 5190,
    strictPort: true,
  },
  preview: {
    port: 5190,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
}));
