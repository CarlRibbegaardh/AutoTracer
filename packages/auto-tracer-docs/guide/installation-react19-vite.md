# React 19 Installation For Vite

This guide covers the Vite build path for `@autotracer/react19` with `@autotracer/plugin-vite-react19`. The build plugin owns code injection, Dashboard mounting, output-mode seeding, and theme-file loading. The runtime initializer `reactTracer()` still has to run before the first client render.

Keep this integration out of public-facing builds. On the Vite path, runtime gating alone is not enough if the build plugin still runs in a public build.

## Tested Integration

The React 19 Vite examples in this repo pin these versions:

- React `19.2.0`
- ReactDOM `19.2.0`
- Vite `8.2.1`
- `@vitejs/plugin-react` `^4.3.1`

The supported React floor is `19.2.0`. This guide does not claim a broader tested Vite range than `8.2.1`.

## Step 1: Install The Packages

```bash
pnpm add react@19.2.0 react-dom@19.2.0 @autotracer/react19 @autotracer/dashboard
pnpm add -D @autotracer/plugin-vite-react19 vite@8.2.1 @vitejs/plugin-react@^4.3.1
```

TypeScript 6 is the minimum supported consumer compiler. The primary React 19 example/build path in this repo uses TypeScript 7.

## Step 2: Register The Vite Plugin Before The React Plugin

The plugin order is important because AutoTracer needs access to the component while the source-level hook declarations still exist.

```ts
// vite.config.ts
import { reactTracer } from "@autotracer/plugin-vite-react19";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const isInternalBrowserBuild =
    mode === "development" || env.VITE_INTERNAL_QA === "true";

  return {
    plugins: isInternalBrowserBuild
      ? [
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
        ]
      : [react()],
  };
});
```

This configuration uses the same `VITE_INTERNAL_QA` flag for the build plugin and runtime initialization. Set it in `.env.qa` and run `pnpm exec vite build --mode qa` for an instrumented QA artifact. See [QA Deployment](/best-practices/production) for deployment and capture.

## Step 3: Initialize The Runtime Before `createRoot(...).render(...)`

```tsx
// src/main.tsx
import { createRoot } from "react-dom/client";

import { App } from "./App.js";

const isInternalBrowserBuild =
  import.meta.env.DEV || import.meta.env.VITE_INTERNAL_QA === "true";

async function renderApplication(): Promise<void> {
  if (isInternalBrowserBuild) {
    const { reactTracer } = await import("@autotracer/react19");

    reactTracer({
      enabled: false,
      outputMode: "copy-paste",
      includeMount: "always",
      includeRendered: "always",
      internalLogLevel: "warn",
    });
  }

  const rootElement = document.getElementById("root");
  if (rootElement === null) {
    throw new Error("Expected the #root element to exist.");
  }

  createRoot(rootElement).render(<App />);
}

void renderApplication();
```

Starting dormant installs the runtime control surface without tracing from the first render. That is the normal browser workflow when the Dashboard is present.

## Build Exclusion And Runtime Exclusion

Use both layers together:

- Conditional plugin registration keeps the tracing transform, Dashboard mounting, and theme loading out of public-facing Vite builds.
- Lazy runtime loading keeps `@autotracer/react19` out of public-facing client startup code.

If you keep the plugin registered and only toggle the runtime, injected tracing code is still present in the built application.

When the plugin is registered, `inject: false` and `TRACE_INJECT=0` disable transforms and the plugin's HTML side effects, including Dashboard mounting and theme loading. Conditional registration is still the cleanest public-build boundary because the AutoTracer integration disappears from the production Vite config entirely.

## Dashboard First, `globalThis` Second

For internal browser apps, use the Dashboard as the normal control surface.

- Start tracing just before the interaction you want.
- Stop tracing immediately afterward.
- Use auto-stop or trigger settings when you need a tighter capture window.

If the Dashboard is not mounted, the lower-level fallback stays available after initialization:

```js
globalThis.autoTracer.reactTracer.start();
globalThis.autoTracer.reactTracer.getRenderCount();
globalThis.autoTracer.reactTracer.stop();
```

## Themes And Runtime Settings

The Vite plugin can load `*react-theme.json`, `*react-theme-light.json`, and `*react-theme-dark.json` from the project root when injection is enabled. The runtime `colors` option still applies, and injected theme files can override overlapping values.

For exact option behavior, use the reference pages instead of treating this installation page as a settings manual:

- [React 19 Vite Plugin Settings](/reference/build/react19/vite/)
- [React 19 Runtime Settings](/reference/runtime/react19/)
- [React 19 Theme API](/themes/react19/api)

## Read Next

- [React 19 Quick Start](/guide/quickstart-react19)
- [React 19 Configuration](/guide/config-react19)
- [React 19 Runtime API](/api/react19)
- [React 19 Vite Plugin API](/api/plugin-vite-react19)
- [Dashboard For Web Apps](/dashboard/webapps)
