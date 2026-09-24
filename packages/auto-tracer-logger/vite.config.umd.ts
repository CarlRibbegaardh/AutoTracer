import { defineConfig } from "vite";
import { resolve } from "path";

/**
 * Vite configuration for building UMD bundle of @autotracer/logger.
 *
 * This UMD build is used for production builds with workspace libraries
 * where the auto-tracer plugin injects imports into libraries that don't
 * have @autotracer/logger as a dependency.
 *
 * The UMD exposes window.ReactTracerLogger global, which rollup-plugin-external-globals
 * maps to during builds.
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReactTracerLogger",
      fileName: () => "index.umd.js",
      formats: ["umd"],
    },
    rollupOptions: {
      // Externalize React and ReactDOM - they must come from the consuming app
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    outDir: "dist",
    emptyOutDir: false, // Don't clear dist since we also have ESM/CJS builds
  },
});
