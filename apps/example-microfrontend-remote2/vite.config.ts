import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { reactTracer } from "@autotracer/plugin-vite-react18";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log("Vite mode:", mode);

  return {
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
        labelHooks: ["useState", "useReducer"],
        labelHooksPattern: "^use[A-Z].*",
        buildWithWorkspaceLibs: true,
      }),
      react(),
      federation({
        name: "remote2",
        filename: "remoteEntry.js",
        manifest: true,
        exposes: {
          "./App": "./src/App.tsx",
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: "^18.3.1",
          },
          "react-dom": {
            singleton: true,
            requiredVersion: "^18.3.1",
          },
          "@autotracer/react18": {
            singleton: true,
          },
        },
      }),
    ],
    server: {
      port: 5192,
      strictPort: true,
      cors: true,
      origin: "http://localhost:5192",
    },
    base: "http://localhost:5192",
    preview: {
      port: 5192,
      strictPort: true,
    },
    build: {
      modulePreload: false,
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
      rollupOptions: {
        external: [],
        output: {
          format: "esm",
        },
      },
    },
  };
});
