# React 19 Example: Vite 8 With TypeScript 7

This example mirrors the repository app `todo-example-vite8-react19-ts7-injected`. Use it as the primary React 19 Vite baseline when you want the current AutoTracer build/compiler path rather than the TypeScript 6 compatibility floor.

The runtime shape matches the TypeScript 6 example: start dormant, control tracing from the Dashboard, and fall back to `globalThis.autoTracer` only when the Dashboard is not the right fit for the session.

## What This Example Pins

- React `19.2.0`
- ReactDOM `19.2.0`
- Vite `8.2.1`
- `@vitejs/plugin-react` `^4.3.1`
- `typescript`: `~7.0.2`

## Package Setup

```bash
pnpm add react@19.2.0 react-dom@19.2.0 @autotracer/react19
pnpm add -D @autotracer/dashboard @autotracer/plugin-vite-react19 @vitejs/plugin-react@^4.3.1 vite@8.2.1 typescript@~7.0.2
```

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
    port: 5208,
    strictPort: true,
  },
  preview: {
    port: 5208,
    strictPort: true,
  },
});
```

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

## Build Command

The TypeScript 7 baseline uses the normal `tsc` binary:

```json
{
  "scripts": {
    "build": "tsc -b && vite build"
  }
}
```

## React Compiler Variant

The repository also contains a compiler twin based on this example. The only meaningful build change is the React plugin section:

```ts
react({
  babel: {
    plugins: [["babel-plugin-react-compiler", { target: "19" }]],
  },
}),
```

Keep `reactTracer.vite(...)` before `react(...)`. That exact order is part of the verified compiler setup.

The current compiler coverage is intentionally narrow:

- `babel-plugin-react-compiler@1.0.0`
- React `19.2.0`
- Vite `8.2.1`
- `@vitejs/plugin-react` 4.x
- compiler target `{ target: "19" }`

The compiler example proves the stack by inspecting the served `App` module for both the compiler memo-cache output and AutoTracer's `labelState`, then running the same labeled browser flow in development and preview mode.

## When To Use This Example

Use this setup when:

- you want the primary React 19 TypeScript baseline;
- you want the verified Vite `8.2.1` browser integration;
- you plan to add the current verified React Compiler stack later; or
- you want one small reference app with the Dashboard and labeled `useState` tracing already wired.

## Read Next

- [React 19 Quick Start](/guide/quickstart-react19)
- [React 19 Vite Installation](/guide/installation-react19-vite)
- [React 19 Configuration](/guide/config-react19)
- [React 19 Runtime API](/api/react19)
- [React 19 Vite Plugin Settings](/reference/build/react19/vite/)
- [React 19 Theme API](/themes/react19/api)
