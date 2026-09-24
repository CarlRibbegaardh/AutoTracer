import { defineConfig } from "vite";
import { resolve } from "path";

/**
 * Vite configuration for building ES module of @autotracer/dashboard.
 *
 * This package provides a framework-agnostic dashboard widget for
 * controlling AutoTracer at runtime via hotkeys and UI controls.
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      fileName: () => "index.js",
      formats: ["es"],
    },
    outDir: "dist",
    emptyOutDir: false, // Don't delete tsc-generated .d.ts files
    minify: false, // Keep readable for debugging
  },
});
