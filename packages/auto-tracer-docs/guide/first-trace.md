# Your First Trace

This walkthrough traces an Increment action through a function call, a React state update, and the resulting render. Use it to learn the capture procedure before applying it to an application scenario.

Use an existing Vite React 19 app with a `dev` script and an HTML entry that loads `src/main.tsx`. For React 18, replace the two `react19` package names below with `react18`. Keep your existing React and Vite versions; check the matching [React 19](/guide/installation-react19-vite) or [React 18](/guide/installation-react-vite) support requirements. Use a small example app or a temporary route when adapting this to an existing application.

## 1. Install and Select the Source

```bash
pnpm add @autotracer/react19 @autotracer/flow
pnpm add -D @autotracer/plugin-vite-react19 @autotracer/plugin-vite-flow @babel/core @babel/preset-typescript
```

Add the tracing plugins to your existing Vite configuration, retaining unrelated plugins and settings:

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react19";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const tracing = mode === "development" || env.VITE_INTERNAL_QA === "true";

  return {
    plugins: [
      ...(tracing ? [
        reactTracer.vite({
          include: { paths: ["**/src/App.tsx"] },
        }),
        flowTracer({
          include: { paths: ["**/src/increment.ts"] },
        }),
      ] : []),
      react(),
    ],
  };
});
```

The React plugin installs the early DevTools hook shim and adds state labels. It must precede the normal React plugin. The Flow plugin instruments the selected function and injects its dormant runtime through Vite's HTML entry. The QA flag includes tracing in a deployed build; it does not change the build's optimization mode. Without that flag, a normal production build excludes both transforms.

For a deployed QA build, set `VITE_INTERNAL_QA=true` in `.env.qa` and run `pnpm exec vite build --mode qa`. Deploy the generated artifact to the restricted QA environment and capture at its URL. The flag is read at build time; changing the serving environment alone does not enable tracing. See [QA Deployment](/best-practices/production) for build and capture details.

## 2. Initialize Before Rendering

```tsx
// src/main.tsx
import { createRoot } from "react-dom/client";
import { App } from "./App";

async function bootstrap() {
  if (import.meta.env.DEV || import.meta.env.VITE_INTERNAL_QA === "true") {
    const { reactTracer } = await import("@autotracer/react19");
    reactTracer({ enabled: false });
  }
  const root = document.getElementById("root");
  if (!root) throw new Error("Missing #root element");
  createRoot(root).render(<App />);
}

void bootstrap();
```

## 3. Provide One Observable Action

```typescript
// src/increment.ts
export function increment(value: number) {
  return value + 1;
}
```

```tsx
// src/App.tsx
import { useState } from "react";
import { increment } from "./increment";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <output data-testid="count">{count}</output>
      <button onClick={() => setCount(increment(count))}>Increment</button>
    </>
  );
}
```

## 4. Run and Capture

Run `pnpm dev`, open the printed URL, and open the browser console. In a fresh browser session, confirm the page shows `0`. Run:

```javascript
globalThis.autoTracer.setOutputMode("copy-paste");
globalThis.autoTracer.flowTracer.start();
globalThis.autoTracer.reactTracer.start();
```

Click **Increment** once and wait until the page shows `1`. Then run these as a separate console command:

```javascript
globalThis.autoTracer.reactTracer.stop();
globalThis.autoTracer.flowTracer.stop();
```

Keep the collected output. Look for `increment`, its parameter `value: 0`, its return value `1`, and an `App` render with the labeled `count` state. React's available before-value can depend on whether that component has already been observed; if the first capture establishes a baseline, capture a second click and inspect the `1 → 2` change.

An illustrative excerpt after a baseline has been observed looks like this; formatting, cycle numbers, and elapsed times vary:

```text
→ increment
param value: 1
returned: 2
← increment (elapsed: …)
...
[App] Rendering
State change count: 1 → 2
```

If either signal is missing, verify that runtime's `isEnabled()` during capture, the selected source path, and existing filters or triggers. An undefined `autoTracer` indicates setup has not completed. Use [integration troubleshooting](/guide/troubleshooting) before concluding that the code did not run.

## 5. Explain What Happened

- **Observed:** `increment` received the previous count and returned the next value. ReactTracer reported `App` activity and the corresponding state value.
- **Source connection:** the button handler passes `increment(count)` to `setCount`. This connects the two observations; adjacent console lines alone would not.
- **Boundary:** this capture covers the selected function and React's reported commit activity. It is not a record of every JavaScript statement or every attempted render.

For an agent, use [Browser Test Capture](/guide/capture/browser-tests) to reproduce this same action and save its console output. For humans, the [Dashboard](/dashboard/webapps) provides start/stop controls. Use [Analyze a Trace](/guide/capture/analyze) to explore longer paths or diagnose unexpected behavior.
