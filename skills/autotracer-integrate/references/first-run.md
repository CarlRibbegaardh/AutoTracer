# First run in an existing Vite app

Inspect the existing scripts, React major, plugin order, and entry point. Preserve unrelated configuration. These snippets use React 19; substitute `react18` in both React package names for React 18. Read installed peer ranges before adding dependencies. For other build systems, use [integration routing](integration-routing.md).

Install the required runtime and transform with the project's package manager. For both signals:

```sh
pnpm add @autotracer/react19 @autotracer/flow
pnpm add -D @autotracer/plugin-vite-react19 @autotracer/plugin-vite-flow @babel/core @babel/preset-typescript
```

Omit React packages for Flow-only work, and Flow packages for React-only work. Adapt these includes to one real component and one function reached by the requested action:

```ts
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
        reactTracer.vite({ include: { paths: ["**/src/App.tsx"] } }),
        flowTracer({ include: { paths: ["**/src/increment.ts"] } }),
      ] : []),
      react(),
    ],
  };
});
```

For a deployed Vite QA build, set `VITE_INTERNAL_QA=true` in `.env.qa` and run `pnpm exec vite build --mode qa`. The flag is consumed at build time; deploy that artifact to the restricted QA environment. Keep the flag absent or false for public builds. Preserve an existing equivalent QA build condition instead of replacing it.

Flow's runtime is injected through Vite HTML and starts dormant. React still needs an initializer. In the existing bootstrap, await this before the existing `createRoot(...).render(...)` call:

```ts
if (import.meta.env.DEV || import.meta.env.VITE_INTERNAL_QA === "true") {
  const { reactTracer } = await import("@autotracer/react19");
  reactTracer({ enabled: false });
}
```

Place it inside an async bootstrap function if top-level await is unsupported. The build plugin must install the DevTools hook before React evaluates; merely delaying `render()` does not replace that early hook.

Run the existing local development command. Attach browser console collection before the interaction and wait for the selected runtime controls to exist. In the page, run:

```js
globalThis.autoTracer.setOutputMode("copy-paste");
globalThis.autoTracer.flowTracer.start();
globalThis.autoTracer.reactTracer.start();
```

Use only the controls for installed tracers. Perform the action, wait for its visible result, then stop those tracers in cleanup. These start/stop operations must bracket an actual interaction, not run consecutively without one. Inspect the output for the selected function and/or component. If silent, use [diagnostics](diagnostics.md).

For a public build, run its normal build command and inspect emitted artifacts for injected calls, runtime imports, Dashboard assets, and AutoTracer globals. Keep the transform and runtime conditions aligned. A QA build may use production optimization while explicitly including tracing.

When the user asked what happens during execution, continue capturing and explaining that action. The installation smoke test is the handoff, not the final answer.
