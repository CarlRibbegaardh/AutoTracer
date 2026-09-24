# Dashboard For Web Apps

For browser-based web apps, the dashboard is the default runtime control surface.

The normal browser workflow is:

1. Keep tracing and the dashboard out of publicly accessible builds.
2. In restricted internal browser builds, start tracing dormant.
3. Use the dashboard to arm a narrow capture window.
4. Reproduce the action you care about.
5. Stop tracing immediately.

## ReactTracer In Browser Apps

When you use ReactTracer in a browser app, the dashboard widget and the React tracer runtime are separate concerns.

The same dashboard package works with React 18 and React 19. Its `React` tab controls the version-neutral `globalThis.autoTracer.reactTracer` surface installed by either runtime; it does not create separate controls for each React product line.

- `dashboardConfig` mounts the widget when injection is enabled.
- `reactTracer(...)` installs the React runtime control surface.
- For targeted browser debugging, start ReactTracer dormant and let the dashboard control when capture begins.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig(({ mode }) => {
  const isInternalBrowserBuild =
    mode === "development" || process.env.INTERNAL_QA === "true";

  return {
    plugins: [
      reactTracer.vite({
        inject: isInternalBrowserBuild,
        dashboardConfig: {
          hideByDefault: true,
        },
      }),
      react(),
    ],
  };
});
```

```typescript
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const isInternalBrowserBuild =
  import.meta.env.DEV || import.meta.env.VITE_INTERNAL_QA === "true";

async function bootstrap(): Promise<void> {
  if (isInternalBrowserBuild) {
    const { reactTracer } = await import("@autotracer/react18");

    reactTracer({
      enabled: false, // Start dormant so the dashboard can target a specific capture window.
    });
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
```

The example above uses the React 18 packages. For React 19, use `@autotracer/plugin-vite-react19` and `@autotracer/react19`; the dashboard workflow and runtime control surface are unchanged.

Use the dashboard to set start and end triggers, enable auto-stop, or briefly start tracing just before the interaction you want to inspect.

## FlowTracer In Browser Apps

With the Vite Flow plugin, dormant browser startup is build-time configuration.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig(({ mode }) => {
  const isInternalBrowserBuild =
    mode === "development" || process.env.INTERNAL_QA === "true";

  return {
    plugins: [
      flowTracer({
        inject: isInternalBrowserBuild,
        runtimeControlled: isInternalBrowserBuild,
        dashboardConfig: isInternalBrowserBuild
          ? {
              hideByDefault: true,
            }
          : undefined,
      }),
    ],
  };
});
```

When `runtimeControlled` is `true`, the Flow browser runtime starts dormant and the dashboard can start, stop, and target it without an extra manual bootstrap in a Vite app.

## Mixed React Plus Flow Browser Apps

When both tracers are present in the same browser runtime, one dashboard widget can control both.

This is the recommended browser setup when you want to correlate function flow with React render output inside one targeted debugging session.

## Output Visibility Still Depends On The Host Platform

The dashboard controls tracing. Trace output still goes to the platform’s normal log surface.

If the host browser surface does not give you a practical way to inspect that output, the dashboard can still control capture, but it does not become a trace viewer.

## Read Next

- [Browser Capture](/guide/capture/browser) for a complete targeted-capture procedure
- [Create A Trace From A Browser Test](/guide/capture/browser-tests) for Playwright console collection and runtime control
- [Dashboard Package Reference](/dashboard/reference) for `mountDashboard(...)`, `globalThis.autoTracer.widget`, and the package-side dashboard settings
- [Dashboard `enabled`](/dashboard/config/enabled), [Dashboard `hideByDefault`](/dashboard/config/hideByDefault), [Dashboard `position`](/dashboard/config/position), and [Dashboard `hotkeys`](/dashboard/config/hotkeys) for the package-side `DashboardConfig` fields
- [React 18 Vite `dashboardConfig`](/reference/build/react18/vite/config/dashboardConfig) or [React 19 Vite `dashboardConfig`](/reference/build/react19/vite/config/dashboardConfig) when the dashboard is mounted from `reactTracer.vite(...)`
- [Flow Vite `dashboardConfig`](/reference/build/flow/vite/config/dashboardConfig) when the dashboard is mounted from `flowTracer(...)`
- [Platform Guidance](/dashboard/platforms) for browser and non-browser runtime constraints
