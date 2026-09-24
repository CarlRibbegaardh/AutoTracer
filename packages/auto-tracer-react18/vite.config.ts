import { defineConfig } from "vite";
import { resolve } from "path";

/**
 * Vite configuration for building UMD bundle of @autotracer/react18.
 *
 * This UMD build is used for production builds with workspace libraries
 * where the auto-tracer plugin injects imports into libraries that don't
 * have @autotracer/react18 as a dependency.
 *
 * The UMD exposes window.ReactTracer global, which rollup-plugin-external-globals
 * maps to during builds.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@logger": new URL("./src/logger", import.meta.url).pathname,
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReactTracer",
      fileName: (format) => format === "es" ? "index.js" : "index.umd.js",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      // Externalize React and ReactDOM - they must come from the consuming app
      // Externalize Node.js built-ins used only in build-time theme loading
      external: ["react", "react-dom", "fs", "path"],
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
