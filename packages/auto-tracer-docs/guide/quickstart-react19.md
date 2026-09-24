# React 19 Quick Start

Set up ReactTracer in an existing React 19 application using Vite or Babel. Call `reactTracer()` before the first client render, keep browser tracing dormant at startup, and use the Dashboard as the normal runtime control surface in internal browser builds.

AutoTracer exposes component structure, props, and state transitions. Keep the runtime, the build plugin, and the Dashboard out of public-facing builds. A runtime switch is useful for a restricted session, but it is not a security boundary.

## Support Floor

- React `19.2.0` and ReactDOM `19.2.0`, or compatible `^19.2.0` releases.
- TypeScript 6 or newer for consumers.
- TypeScript 7 for the primary AutoTracer React 19 package build.
- The tested Vite integration in this repo uses Vite `8.2.1`.

## Recommended Browser Workflow

```mermaid
flowchart LR
  build[Internal browser build only] --> inject[Build plugin injects labels and Dashboard wiring]
  inject --> init[reactTracer({ enabled: false }) before render]
  init --> dashboard[Start tracing from the Dashboard]
  dashboard --> reproduce[Reproduce one narrow interaction]
  reproduce --> stop[Stop tracing immediately]
  init --> fallback[If no Dashboard: globalThis.autoTracer.reactTracer.start()]
```

The Dashboard controls tracing, but it does not become a trace viewer. Trace output still goes to the browser's normal logging surface.

## Step 1: Install The Packages

For a Vite app:

```bash
pnpm add @autotracer/react19 @autotracer/dashboard
pnpm add -D @autotracer/plugin-vite-react19
```

For a Babel or Next.js App Router app:

```bash
pnpm add @autotracer/react19 @autotracer/dashboard
pnpm add -D @autotracer/plugin-babel-react19
```

## Step 2: Initialize The Runtime Before React Renders

The runtime starts dormant by default. In browser apps, keep that default and start tracing only when you are ready to capture one interaction window.

The initialization example below is for Vite and includes restricted QA builds. Apply the same QA condition to the build plugin. For Next.js, use the client initialization shown in the [App Router installation guide](/guide/installation-react19-nextjs-app).

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

That startup shape matches the React 19 Vite example apps in this workspace. The important boundary is the placement: `reactTracer()` runs before `createRoot(...).render(...)`.

## Step 3: Add Build-Time Labels

Build-time injection adds `useReactTracer()` and hook labels so the runtime can report state names such as `count` instead of just unlabeled values.

- For Vite, use [React 19 Vite Installation](/guide/installation-react19-vite).
- For Babel and Next.js App Router, use [React 19 Next.js App Router Installation](/guide/installation-react19-nextjs-app).

## Step 4: Start And Stop Tracing

In browser-based internal apps, the Dashboard is the normal control surface.

- Mount it through the Vite plugin `dashboardConfig` path, or with `mountDashboard(...)` on the Babel path.
- Start tracing just before the interaction you care about.
- Stop tracing as soon as the capture window is finished.

If the Dashboard is not available, use the lower-level fallback on `globalThis.autoTracer`:

```js
globalThis.autoTracer.setOutputMode("copy-paste");
globalThis.autoTracer.reactTracer.start();

// Reproduce one interaction.

globalThis.autoTracer.reactTracer.stop();
```

## React 19 Hook Behavior

The React 19 runtime preserves the React 18 public tracing model. `useActionState` and `useOptimistic` do not introduce a separate logger format. They use the same generic `labelState()` path used for existing state hooks.

## Read Next

- [Browser Capture](/guide/capture/browser) - capture an action in a running application, locally or in QA

- [React 19 Vite Installation](/guide/installation-react19-vite)
- [React 19 Next.js App Router Installation](/guide/installation-react19-nextjs-app)
- [React 19 Configuration](/guide/config-react19)
- [React 19 Runtime API](/api/react19)
- [React 19 Runtime Settings](/reference/runtime/react19/)
- [React 19 Theme API](/themes/react19/api)
- [Dashboard For Web Apps](/dashboard/webapps)
