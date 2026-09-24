import { resolve } from "path";
import { defineConfig } from "vite";

/**
 * Builds the ESM distribution for `@autotracer/network`.
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "NetworkTracer",
      fileName: "index",
      formats: ["es"],
    },
    outDir: "dist",
    emptyOutDir: false,
  },
});