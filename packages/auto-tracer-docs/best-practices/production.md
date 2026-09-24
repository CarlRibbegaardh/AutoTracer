# Deployment Safety

Keep AutoTracer out of publicly accessible production builds.

## Overview

AutoTracer is a development and debugging tool for local development and restricted test or QA deployments. A public production build should not ship AutoTracer instrumentation, runtime imports, or browser control surfaces.

If a build is publicly accessible, the safe rule is simple:

- do not inject tracing code into that build
- do not import tracing runtimes into that build
- do not ship the dashboard into that build
- or do not use AutoTracer in that app at all

## Safe Patterns

The examples below show local-development conditions. For a restricted QA build, use your project's QA build condition in both the plugin configuration and runtime imports. A QA build can use production optimizations and still include tracing.

### 1. Condition the Plugin So Public Builds Do Not Inject

**Best for:** Apps that use the Vite or Babel plugins during local development

Use build-time conditions so public production builds receive no tracing injection.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { flowTracer } from "@autotracer/plugin-vite-flow";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig(({ mode }) => ({
  plugins: [
    reactTracer.vite({
      inject: mode === "development",
      mode: "opt-out",
    }),
    flowTracer({
      inject: mode === "development",
      include: { paths: ["src/**"] },
    }),
    react(),
  ],
}));
```

```javascript
// babel.config.js
const plugins = [];

if (process.env.NODE_ENV === "development") {
  plugins.push(
    ["@autotracer/plugin-babel-react18", { mode: "opt-out" }],
    ["@autotracer/plugin-babel-flow", { include: { paths: ["lib/**"] } }],
  );
}

module.exports = {
  presets: ["next/babel"],
  plugins,
};
```

### 2. Condition Manual Imports So Public Builds Exclude Them

**Best for:** Apps that bootstrap AutoTracer manually instead of relying only on plugin-side runtime injection

Put manual imports behind a compile-time-removable guard so they do not survive into the public production bundle.

```typescript
// app initialization
async function bootstrap(): Promise<void> {
  if (import.meta.env.DEV) {
    const { reactTracer } = await import("@autotracer/react18");

    await import("@autotracer/flow");

    reactTracer({ enabled: true });
  }

  await import("./app");
}

void bootstrap();
```

If your internal-only build also imports `@autotracer/flow/runtime` or mounts `@autotracer/dashboard`, keep those imports behind the same compile-time-removable guard.

### 3. Do Not Use AutoTracer In That App

**Best for:** Public apps with no internal browser-debugging requirement

Leave the plugins, runtime imports, and dashboard out of the project entirely. This is the simplest public-production path.

## Production Checklist

- Public production build does not inject ReactTracer or FlowTracer.
- Public production bootstrap does not import `@autotracer/react18`, `@autotracer/flow`, or `@autotracer/flow/runtime`.
- Public production build does not ship `@autotracer/dashboard`.
- Production smoke test shows no tracing UI, no tracing logs, and no `globalThis.autoTracer` runtime surface.
- Bundle inspection confirms tracing packages are absent from the public artifact.

## Related Documentation

- [Configuration Reference - ReactTracer](/guide/config-react)
- [Configuration Reference - FlowTracer](/guide/config-flow)
- [Dashboard For Web Apps](/dashboard/webapps)
- [Troubleshooting](/guide/troubleshooting)
