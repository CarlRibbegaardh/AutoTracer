# React 19 Example: Vite 8 With TypeScript 6

This example mirrors the repository app `todo-example-vite8-react19-ts6-injected`. Use it when you want the smallest React 19 Vite setup that still proves the supported TypeScript 6 consumer floor.

The browser workflow stays the same as the main React 19 guidance: dormant runtime startup, Dashboard-first control, and `globalThis.autoTracer` as the lower-level fallback.

## What This Example Pins

- React `19.2.0`
- ReactDOM `19.2.0`
- Vite `8.2.1`
- `@vitejs/plugin-react` `^4.3.1`
- `typescript`: `npm:@typescript/typescript6@~6.0.2`

## Package Setup

```bash
pnpm add react@19.2.0 react-dom@19.2.0 @autotracer/react19
pnpm add -D @autotracer/dashboard @autotracer/plugin-vite-react19 @vitejs/plugin-react@^4.3.1 vite@8.2.1 typescript@npm:@typescript/typescript6@~6.0.2
```

The dependency alias installs the TypeScript 6 package under the normal `typescript` name, so Vite and editor tooling find it where they expect.

## Vite Configuration

```ts
import { reactTracer } from "@autotracer/plugin-vite-react19";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactTracer.vite({
      inject: true,
      mode: "opt-out",
      importSource: "@autotracer/react19",
      include: {
        paths: ["src/**/*.tsx"],
      },
      exclude: {
        paths: [
          "**/*.test.*",
          "**/*.spec.*",
          "**/node_modules/**",
          "**/dist/**",
        ],
      },
      labelHooks: ["useState"],
      outputMode: "copy-paste",
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
    port: 5207,
    strictPort: true,
  },
  preview: {
    port: 5207,
    strictPort: true,
  },
});
```

The plugin stays before `react()`. That order is part of the verified integration.

## Runtime Startup

```tsx
import { reactTracer } from "@autotracer/react19";
import { createRoot } from "react-dom/client";

import { App } from "./App.js";

reactTracer({
  enabled: false,
  outputMode: "copy-paste",
  includeMount: "always",
  includeRendered: "always",
  internalLogLevel: "warn",
});

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Expected the #root element to exist.");
}

createRoot(rootElement).render(<App />);
```

The dormant startup is intentional. Open the page, start tracing from the Dashboard, reproduce one interaction, and stop tracing immediately.

## Build Command

The TypeScript 6 example uses the `tsc6` binary:

```json
{
  "scripts": {
    "build": "tsc6 -b && vite build"
  }
}
```

The `tsc6` build checks the TypeScript 6 source path without changing the rest of the Vite integration.

## When To Use This Example

Use this setup when:

- your app still compiles with TypeScript 6;
- you want the verified React 19 Vite path without adding React Compiler yet; or
- you want a minimal browser example that still includes Dashboard control and labeled `useState` output.

## Read Next

- [React 19 Quick Start](/guide/quickstart-react19)
- [React 19 Vite Installation](/guide/installation-react19-vite)
- [React 19 Runtime API](/api/react19)
- [React 19 Vite Plugin Settings](/reference/build/react19/vite/)
- [React 19 Theme API](/themes/react19/api)
