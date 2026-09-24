import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";
import path from "path";
import fs from "fs";

/**
 * Vite plugin to serve built UMD bundle during dev mode.
 * This allows the islands loader to request /island.umd.js from the dev server.
 */
function serveDistInDev(): Plugin {
  return {
    name: "serve-dist-in-dev",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/island.umd.js" || req.url === "/island.css") {
          const filePath = path.resolve(__dirname, "dist", req.url.slice(1));
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath);
            const contentType = req.url.endsWith(".js")
              ? "application/javascript"
              : "text/css";
            res.setHeader("Content-Type", contentType);
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(content);
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    serveDistInDev(),
    reactTracer.vite({
      prefix: "Island1",
      mode: "opt-out",
      importSource: "@autotracer/react18",
      include: {
        paths: ["src/**/*.tsx"],
      },
      exclude: {
        paths: ["**/*.test.*", "**/*.spec.*"],
      },
      labelHooks: ["useState", "useReducer"],
      labelHooksPattern: "^use[A-Z].*",
      buildWithWorkspaceLibs: false,
    }),
    react(),
  ],
  server: {
    port: 5201,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5201,
    strictPort: true,
    cors: true,
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/mount.tsx"),
      name: "Island1",
      formats: ["umd"],
      fileName: () => "island.umd.js",
    },
    rollupOptions: {
      external: [], // Bundle everything - no externals
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "island.css";
          return assetInfo.name || "asset";
        },
      },
    },
  },
});
