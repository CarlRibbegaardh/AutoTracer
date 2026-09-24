# Troubleshooting

Common issues and solutions for AutoTracer (both FlowTracer and ReactTracer).

## ReactTracer Issues

### No Tracing Output

**Symptom:** Browser console shows no ReactTracer output when components render.

**Solutions:**

1. **Verify initialization order**

   `reactTracer()` must be called BEFORE React renders:

   ```typescript
   // ✅ Correct - tracer initialized first
   import { createRoot } from "react-dom/client";

   async function bootstrap(): Promise<void> {
     const { reactTracer } = await import("@autotracer/react18");

     reactTracer({ enabled: true });
     createRoot(document.getElementById("root")!).render(<App />);
   }

   void bootstrap();

   // ❌ Wrong - too late
   createRoot(document.getElementById("root")!).render(<App />);
   reactTracer({ enabled: true }); // Won't work
   ```

For internal browser apps that use dormant startup, the same rule still applies: initialize early with `enabled: false`, then start tracing later from the Dashboard when that workflow is mounted.

2. **If ReactTracer started dormant, turn tracing on**

When you initialize ReactTracer with `enabled: false`, the runtime is installed but tracing stays off. No trace output is expected until you start it.

In internal browser apps that mount the Dashboard, use the Dashboard as the normal control surface. In non-Dashboard setups, start tracing through the lower-level runtime API:

```typescript
reactTracer({ enabled: false });
globalThis.autoTracer.reactTracer.start();
```

3. **Verify React DevTools is not disabled**

   ReactTracer requires React DevTools hook. Check browser console for:

   ```
   React DevTools not detected
   ```

4. **Check for conflicting React versions**

   ```bash
   pnpm list react
   # Should show single version of React 18+
   ```

### Variable Names Not Showing

**Symptom:** Seeing `State change: 0 → 1` instead of `State change count: 0 → 1`

**Solutions:**

1. **Install and configure build plugin**

   ```bash
   pnpm add -D @autotracer/plugin-vite-react18
   ```

   ```typescript
   // vite.config.ts
   import { reactTracer } from "@autotracer/plugin-vite-react18";

   export default defineConfig({
     plugins: [reactTracer.vite({ inject: true }), react()],
   });
   ```

2. **Verify plugin order**

   ReactTracer plugin must come BEFORE React plugin:

   ```typescript
   // ✅ Correct order
   plugins: [reactTracer.vite({ inject: true }), react()];

   // ❌ Wrong order
   plugins: [
     react(),
     reactTracer.vite({ inject: true }), // Too late
   ];
   ```

3. **Check file patterns**

   Ensure your files match plugin configuration:

   ```typescript
   reactTracer.vite({
     include: {
       paths: ["src/**/*.tsx", "src/**/*.jsx"],
     },
   });
   ```

### All State Variable Names Show as `unknown`

**Symptom:** Render output appears correctly (component names, update counts), but every state variable name is reported as `unknown` instead of its actual name.

**Cause:** The browser is serving a stale pre-bundled copy of `@autotracer/react18` from its disk cache. Vite pre-bundles dependencies under `.vite/deps/` and adds a `?v=<hash>` cache-busting parameter. If the hash does not change between two builds (for example after running `vite --force`), the browser considers its cached copy valid and never fetches the updated file.

The stale bundle predates the label-tracking fix, so `labelState` silently skips every call and the label registry stays empty. `resolveHookLabel` then falls back to `"unknown"` for every state anchor.

**Why "Disable cache" in DevTools does not always help:**

The **Disable cache** checkbox in Chrome DevTools only bypasses the HTTP cache while DevTools is open. If the page was ever loaded with DevTools closed — or a service worker cached the file — the old version persists on disk.

**Fix:**

Clear the full browser disk cache:

- **Chrome / Edge:** `Ctrl+Shift+Delete` → select **Cached images and files** → **Clear data**

Then hard-refresh the page (`Ctrl+Shift+R`).

**Quick check — incognito first:**

If the app behaves correctly in an incognito window but not in a regular window, a stale browser cache is the first thing to rule out. Incognito windows start with an empty disk cache and always fetch the latest file from the dev server.

---

### No Tracing After Deployment (Server-Rendered HTML Shell)

**Symptom:** ReactTracer works in local development but produces no output after deployment. Installing the React DevTools browser extension restores tracing.

**Cause:** The Vite plugin injects a React DevTools hook shim as the first inline `<script>` in `dist/index.html`. When the HTML page is not served from the Vite output — for example, when a backend server renders the HTML template and only the compiled JS and CSS files are copied from `dist/` — the shim never reaches the browser.

React DOM captures its reference to `window.__REACT_DEVTOOLS_GLOBAL_HOOK__` when it first evaluates. If the hook is absent at that moment, React never registers with it and `onCommitFiberRoot` is never called for the lifetime of the page. The React DevTools browser extension bypasses this constraint by injecting the hook via a privileged browser content script that runs before any page script.

**Option 1 — Require the browser extension (zero code changes)**

Instruct every team member using ReactTracer in that environment to install the [React Developer Tools](https://react.dev/learn/react-developer-tools) browser extension. The extension injects the hook automatically regardless of how the HTML is delivered.

**Option 2 — Add the shim to the server-rendered template**

Add the following script block to the `<head>` of your HTML template, **before all other scripts**. The hook must exist before React DOM evaluates.

```html
<script>
(function() {
  if (typeof window === 'undefined' || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) return;
  var nextID = 0;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    renderers: new Map(),
    supportsFiber: true,
    inject: function(injected) { return nextID++; },
    onScheduleFiberRoot: function(id, root, children) {},
    onCommitFiberRoot: function(id, root, maybePriorityLevel, didError) {},
    onCommitFiberUnmount: function() {}
  };
})();
</script>
```

This is the same shim the Vite plugin writes into `dist/index.html` automatically when it controls the HTML shell.

**Option 3 — Bundle the shim into the app entry point**

Create a standalone shim module with no imports and make it the **very first import** in your entry file. Rollup inlines it before React DOM in the output bundle.

```typescript
// src/devtools-shim.ts
if (typeof window !== 'undefined' && !window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  let nextID = 0;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    renderers: new Map(),
    supportsFiber: true,
    inject: (_injected: unknown) => nextID++,
    onScheduleFiberRoot: () => {},
    onCommitFiberRoot: () => {},
    onCommitFiberUnmount: () => {},
  };
}
```

```typescript
// src/main.tsx — shim must be the very first import
import './devtools-shim.js';
import { reactTracer } from '@autotracer/react18';
// ... rest of app
```

::: warning Single-chunk builds only
This works when Vite produces a single output chunk, which is the default for single-page apps. If you configure `manualChunks` to split React or `react-dom` into a separate vendor chunk, that chunk evaluates before the entry point code and the shim will not run in time. Use Option 2 instead.
:::

---

### Too Much Output

**Symptom:** Console is flooded with tracing messages.

**Solutions:**

1. **Use component visibility filtering**

   ```typescript
   reactTracer({
     includeMount: "forPropsOrState",
     includeRendered: "forPropsOrState",
     includeReconciled: "never",
   });
   ```

2. **Exclude third-party components (via plugin)**

   ```typescript
   reactTracer.vite({
     exclude: {
       paths: ["node_modules/**", "**/node_modules/**"],
     },
   });
   ```

3. **Use opt-in mode**

   ```typescript
   // vite.config.ts
   reactTracer.vite({
     mode: "opt-in", // Only trace @trace components
   });

   // Component code
   // @trace
   export function ImportantComponent() {
     return <div />;
   }
   ```

> **Note:** `include`/`exclude` component filters are evaluated before pragma signals. `@trace` only operates within the eligible set. For exact placement and precedence rules, see [Pragma Comments](/reference/build/react18/vite/pragmas).

### Missing Component Names

**Symptom:** Seeing `[Unknown]` or `[Anonymous]` instead of component names.

**Solutions:**

1. **Use named function declarations**

   ```typescript
   // ✅ Good - has name
   function UserProfile() {
     return <div>Profile</div>;
   }

   // ❌ Bad - anonymous
   export default () => <div>Profile</div>;
   ```

2. **Add displayName**

   ```typescript
   const MyComponent = () => <div>Content</div>;
   MyComponent.displayName = "MyComponent";
   ```

### Instrumented components missing from traces

**Symptom:** A component has `useReactTracer` injected (visible in the compiled bundle output) but never appears in the console trace, even while the app is actively tracing.

**Cause:** The React fiber tree traversal hit the current `maxFiberDepth` limit before reaching the component. This limit applies to the full fiber tree, including providers, wrappers, and library components above the instrumented component.

**Diagnosis:**

```js
// 1. Confirm no runtime filter is hiding the component
autoTracer.reactTracer.showFilters();
// → exclude: { components: [] }   (empty = not a filter issue)

// 2. If filters are empty and the component is still missing, it's depth
```

**Fix:**

```typescript
// src/main.tsx
reactTracer({ maxFiberDepth: 1000 });
```

---

### Performance Issues

**Symptom:** Application is slower with ReactTracer enabled.

**Solutions:**

1. **Reduce fiber depth limit**

   ```typescript
   reactTracer({
     maxFiberDepth: 50, // Lower depth limit
   });
   ```

2. **Filter components (via plugin)**

   ```typescript
   reactTracer.vite({
     exclude: {
       components: ["Button", "Icon", "*Item"],
     },
   });
   ```

3. **Only enable in development**

   ```typescript
   reactTracer({
     enabled: import.meta.env.DEV,
   });
   ```

## FlowTracer Issues

### No Tracing Output

**Symptom:** Functions execute but no FlowTracer output appears.

**Solutions:**

1. **Verify build plugin is configured**

   ```typescript
   // vite.config.ts
   import { defineConfig } from "vite";
   import { flowTracer } from "@autotracer/plugin-vite-flow";

   export default defineConfig({
     plugins: [
       flowTracer({
         inject: true,
       }),
     ],
   });
   ```

2. **Check file patterns match your source**

   ```typescript
   // vite.config.ts (snippet)
   import { flowTracer } from "@autotracer/plugin-vite-flow";

   flowTracer({
     include: {
       paths: ["src/**/*.{ts,tsx,js,jsx}"],
     },
   });
   ```

3. **Verify FlowTracer is installed**

The Vite plugin injects a side-effect import of `@autotracer/flow` into the HTML, which ensures `globalThis.__flowTracer` (internal instrumentation target) and `globalThis.autoTracer.flowTracer` (runtime controls) are installed.

In the browser console, verify:

```typescript
globalThis.autoTracer?.flowTracer;
```

Also verify the internal instrumentation target exists:

```typescript
globalThis.__flowTracer;
```

4. **Check function filtering**

   ```typescript
   // vite.config.ts (snippet)
   import { flowTracer } from "@autotracer/plugin-vite-flow";

   // If you set include.functions, only those functions are instrumented.
   // If you set exclude.functions, those functions are skipped.
   flowTracer({
     include: {
       functions: ["calculate*", /^(fetch|load)[A-Z]/],
     },
     exclude: {
       functions: ["helper*"],
     },
   });
   ```

### Functions Not Instrumented

**Symptom:** Some functions don't appear in traces.

**Solutions:**

1. **Check exclude patterns**

   ```typescript
   // vite.config.ts (snippet)
   import { flowTracer } from "@autotracer/plugin-vite-flow";

   flowTracer({
     exclude: {
       paths: ["**/*.{test,spec}.{ts,tsx,js,jsx}"], // Make sure not excluding too much
     },
   });
   ```

2. **Verify function is exported or used**

   Build plugins may skip unused functions. Ensure function is actually called.

3. **Check function name / path filtering**

FlowTracer filtering is controlled by the build plugin `include` / `exclude` config.

### Build Errors After Adding Plugin

**Symptom:** Build fails with syntax errors after adding FlowTracer plugin.

**Solutions:**

1. **Ensure plugin is in correct position**

   For Vite, FlowTracer should generally come first:

   ```typescript
   export default defineConfig({
     plugins: [
       flowTracer({
         /* config */
       }),
       // other plugins
     ],
   });
   ```

2. **Check TypeScript configuration**

   Ensure `tsconfig.json` is compatible:

   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext"
     }
   }
   ```

3. **Try disabling temporarily**

   ```typescript
   // vite.config.ts (snippet)
   import { flowTracer } from "@autotracer/plugin-vite-flow";

   flowTracer({
     inject: false, // Disable to test
   });
   ```

### Async Functions Not Traced Properly

**Symptom:** Async function output is incomplete or missing.

**Solution:**

FlowTracer handles async automatically, but ensure you're awaiting:

```typescript
// ✅ Properly awaited
const result = await fetchData();

// ⚠️ Not awaited - promise logged immediately
const result = fetchData(); // Shows Promise<pending>
```

## General Issues

### Console is Cleared Automatically

**Symptom:** Traces disappear from console.

**Solutions:**

1. **Enable "Preserve log" in browser DevTools**
   - Chrome: DevTools → Console → ⚙️ Settings → Preserve log
   - Firefox: DevTools → Console → ⚙️ Settings → Enable persistent logs

2. **Use browser groups output mode**

   ```typescript
   reactTracer({ outputMode: "devtools" });
   // Or toggle at runtime from DevTools:
   globalThis.autoTracer.setOutputMode("devtools");
   ```

### TypeScript Errors

**Symptom:** TypeScript compilation errors related to AutoTracer.

**Solutions:**

1. **Install type definitions**

   Types are included, but verify installation:

   ```bash
   pnpm list @autotracer/react18
   pnpm list @autotracer/flow
   ```

2. **Check import paths**

   ```typescript
   // ✅ Correct
   import { reactTracer } from "@autotracer/react18";
   import "@autotracer/flow";

   // ❌ Wrong
   import reactTracer from "@autotracer/react18"; // No default export
   ```

### Hot Module Reload (HMR) Issues

**Symptom:** Tracers stop working after HMR update.

**Solutions:**

1. **Add HMR cleanup for ReactTracer**

   ```typescript
   // src/main.tsx
   const stopTracing = reactTracer({ enabled: true });

   if (import.meta.hot) {
     import.meta.hot.dispose(() => {
       stopTracing();
     });

     import.meta.hot.accept(() => {
       reactTracer({ enabled: true }); // Reinitialize
     });
   }
   ```

2. **Restart dev server**

   Sometimes a full restart resolves HMR issues:

   ```bash
   # Stop dev server
   # Then restart
   pnpm dev
   ```

### Production Build Contains Tracing Code

**Symptom:** Tracing code is present in production build.

**Solutions:**

1. **Keep plugins configured and gate them with `inject`**

   ```typescript
   // vite.config.ts
   import { defineConfig } from "vite";
   import { flowTracer } from "@autotracer/plugin-vite-flow";
   import { reactTracer } from "@autotracer/plugin-vite-react18";

   export default defineConfig(({ mode }) => ({
     plugins: [
       flowTracer({
         inject: mode === "development",
         /* config */
       }),
       reactTracer.vite({
         inject: mode === "development",
         /* config */
       }),
     ],
   }));
   ```

   When `inject` is `false`, the plugin becomes a full no-op for that build.

2. **Verify build command**

   ```bash
   # Ensure building for production
   pnpm build
   # Not
   pnpm dev
   ```

3. **Check environment**

   ```typescript
   if (import.meta.env.DEV) {
     reactTracer({ enabled: true });
   }
   ```

## Getting More Help

### Enable Debug Mode

For detailed diagnostics:

```typescript
reactTracer({
  // Enable ReactTracer internal diagnostics.
  internalLogLevel: "debug",
});

// If you enabled Flow runtime control (Vite plugin: runtimeControlled: true),
// use the Dashboard as the normal browser control surface when it is mounted.
// Otherwise the lower-level runtime API remains available:
globalThis.autoTracer.flowTracer.start();
globalThis.autoTracer.flowTracer.stop();
globalThis.autoTracer.setOutputMode("devtools");
globalThis.autoTracer.setOutputMode("copy-paste");
```

### Check Browser Console for Errors

Look for:

- Red error messages
- Warning about React DevTools
- Plugin initialization errors

### Verify Versions

```bash
pnpm list @autotracer/react18
pnpm list @autotracer/flow
pnpm list @autotracer/plugin-vite-react18
pnpm list @autotracer/plugin-vite-flow
```

Ensure all AutoTracer packages are on compatible versions.

### Create Minimal Reproduction

If issues persist, create a minimal reproduction:

1. Start with create-vite template
2. Add AutoTracer
3. Test with single component/function
4. Share reproduction for support

## Still Having Issues?

- Review [Configuration Guides](./config-react) for all options
- Check [Examples](/examples/basic-usage) for working patterns
- Review [Best Practices](/best-practices/security) for optimization
- Consult package README files in the repository
