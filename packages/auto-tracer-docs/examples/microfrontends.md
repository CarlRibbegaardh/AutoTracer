# Microfrontends

This page covers browser-based React microfrontends that use `@autotracer/plugin-vite-react18` for build-time injection and `reactTracer()` for runtime startup.

When a host app and its remotes share one browser runtime, all traced React components write to the same output stream. AutoTracer does not infer a microfrontend name automatically, so use the plugin-level [`prefix`](/reference/build/react18/vite/config/prefix) option when you need stable labels per build.

## Vite Setup

Configure the host build and each remote build with `reactTracer.vite()`. Place the tracer plugin before the React plugin in every app that should inject labels.

```typescript
// host/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig(({ mode }) => {
  const isInternalBrowserBuild =
    mode === "development" || process.env.INTERNAL_QA === "true";

  return {
    plugins: [
      reactTracer.vite({
        inject: isInternalBrowserBuild,
        prefix: "host",
      }),
      react(),
      federation({
        name: "host",
        remotes: {
          catalog: "http://localhost:3001/assets/remoteEntry.js",
          cart: "http://localhost:3002/assets/remoteEntry.js",
        },
        shared: ["react", "react-dom"],
      }),
    ],
  };
});
```

```typescript
// catalog/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig(({ mode }) => {
  const isInternalBrowserBuild =
    mode === "development" || process.env.INTERNAL_QA === "true";

  return {
    plugins: [
      reactTracer.vite({
        inject: isInternalBrowserBuild,
        prefix: "catalog",
      }),
      react(),
      federation({
        name: "catalog",
        filename: "remoteEntry.js",
        exposes: {
          "./ProductCatalog": "./src/ProductCatalog",
        },
        shared: ["react", "react-dom"],
      }),
    ],
  };
});
```

```typescript
// cart/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig(({ mode }) => {
  const isInternalBrowserBuild =
    mode === "development" || process.env.INTERNAL_QA === "true";

  return {
    plugins: [
      reactTracer.vite({
        inject: isInternalBrowserBuild,
        prefix: "cart",
      }),
      react(),
      federation({
        name: "cart",
        filename: "remoteEntry.js",
        exposes: {
          "./ShoppingCart": "./src/ShoppingCart",
        },
        shared: ["react", "react-dom"],
      }),
    ],
  };
});
```

## Runtime Startup

In the shared browser runtime, initialize `reactTracer()` before React renders. For restricted internal browser builds, start dormant and use the [Dashboard workflow](/dashboard/webapps) to target a narrow capture window.

```typescript
// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App";

const isInternalBrowserBuild =
  import.meta.env.DEV || import.meta.env.VITE_INTERNAL_QA === "true";

async function bootstrap(): Promise<void> {
  if (isInternalBrowserBuild) {
    const { reactTracer } = await import("@autotracer/react18");

    reactTracer({
      enabled: false,
    });
  }

  createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap();
```

## Output Shape

Without `prefix`, all microfrontends share one output stream and the component names appear exactly as they are injected.

With `prefix`, the same shared output becomes easier to route by build:

```
Component render cycle 1:
├─ [host:App] Rendering ⚡
│   State change currentRoute: "/" → "/products"

Component render cycle 2:
├─ [catalog:ProductCatalog] Mount ⚡
│   Initial state products: []
│   Initial state loading: true

Component render cycle 3:
├─ [cart:ShoppingCart] Rendering ⚡
│   State change items: [] → [{id: "1", quantity: 1}]
```

AutoTracer does not add `[host]` or `[remote]` tags automatically. The trace rows reflect component names only, plus any build-time `prefix` values you configured.

## Narrowing Scope

When one remote is noisy, narrow the injected set instead of tracing every microfrontend in the page.

```typescript
// host/vite.config.ts
reactTracer.vite({
  prefix: "host",
});

// catalog/vite.config.ts
reactTracer.vite({
  prefix: "catalog",
});

// cart/vite.config.ts
reactTracer.vite({
  inject: false,
});
```

`include` and `exclude` filters are still evaluated before pragma comments. `@trace` only operates inside the eligible set.

## Public Builds

Keep tracing out of publicly accessible builds. Guard `inject` so the host and each remote only instrument local development or restricted internal browser builds.

```typescript
export default defineConfig(({ mode }) => {
  const isInternalBrowserBuild =
    mode === "development" || process.env.INTERNAL_QA === "true";

  return {
    plugins: [
      reactTracer.vite({
        inject: isInternalBrowserBuild,
        prefix: "host",
      }),
      react(),
    ],
  };
});
```

## Related Docs

- [ReactTracer Configuration](/guide/config-react) - runtime and build-time split
- [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/) - exact `reactTracer.vite()` option behavior
- [@autotracer/plugin-vite-react18](/api/plugin-vite-react18) - package usage and examples
- [Dashboard For Web Apps](/dashboard/webapps) - targeted browser capture workflow

## Next Steps

- [Islands Architecture](/examples/islands) - Component isolation patterns
- [Custom Filtering](/examples/custom-filtering) - Advanced filtering
- [Advanced Patterns](/examples/advanced-patterns) - Complex scenarios
- [Production Optimization](/best-practices/production) - Deployment strategies
