# @autotracer/plugin-vite-react18

**Automatic React component tracing for Vite projects.**

This Vite plugin automatically injects `useReactTracer()` hooks into your React components at build time, enabling automatic state and prop labeling without manual instrumentation.

Recommended Vite path: use `reactTracer.vite()` in `vite.config.ts` for build-time injection, initialize `reactTracer()` before React renders, and use the Dashboard as the normal browser control surface in restricted internal builds. When the Dashboard is not available, use the lower-level `globalThis.autoTracer` runtime control surface.

## What You Get

- **Reliable component tracking** - Marks components for tracing, ensuring they're tracked
- **Perfect variable names** - Extract state/prop variable names from your source code
- **Better state change detection** - More reliable than fiber-only traversal
- **Development-focused** - Control injection per environment
- **Next-gen build tool** - Instant HMR during development
- **TypeScript native** - Full type safety and inference
- **JSX/TSX support** - Automatic React component detection
- **Variable name extraction** - See readable state labels in traces
- **Improved change detection** - Correctly resolves top level state for nested hooks, complex hooks such as selectors or rtkquery mutations, or proxied states such as react hook form.
- **Pragma support** - Fine-grained opt-in/opt-out control at component level
- **Include/Exclude** patterns in plugin config for file inclusion/exclusion.
- **Hook naming config** to cover edge cases with esoteric hook naming schemes.
  - Default handles ^use[A-Z].\*

## Installation

```bash
pnpm add @autotracer/react18
pnpm add -D @autotracer/plugin-vite-react18
```

## Documentation

Use the documentation site for the recommended React integration path and the canonical reference pages:

- Vite installation: https://docs.autotracer.dev/guide/installation-react-vite
- React configuration guide: https://docs.autotracer.dev/guide/config-react
- Vite plugin settings: https://docs.autotracer.dev/reference/build/react18/vite/
- Pragma comments: https://docs.autotracer.dev/reference/build/react18/vite/pragmas
- React runtime settings: https://docs.autotracer.dev/reference/runtime/react18/
- Vite plugin API: https://docs.autotracer.dev/api/plugin-vite-react18
- React runtime API: https://docs.autotracer.dev/api/react18
- Dashboard workflow: https://docs.autotracer.dev/dashboard/webapps
- React theme API: https://docs.autotracer.dev/themes/react18/api
- React theme examples: https://docs.autotracer.dev/themes/react18/examples
- Monorepo setup: https://docs.autotracer.dev/guide/monorepo

## Usage

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig(({ mode }) => ({
  plugins: [
    reactTracer.vite({
      inject: mode === "development",
    }),
    react(),
  ],
}));
```

### Configuration Options

#### `inject`

Type: `boolean`
Default: `true`

Controls whether code injection is enabled. Use this to conditionally enable the plugin based on mode or environment:

```ts
// Cleaner syntax - inject only in development
reactTracer.vite({
  inject: mode === "development",
  // ...other options
});

// Alternative: always include plugin, control via environment
reactTracer.vite({
  include: { paths: ["src/**/*.tsx"] },
  // ...other options
});
// Then use TRACE_INJECT=0 to disable
```

When `false`, the plugin is effectively disabled and no transformations occur. This is useful for:

- Making the plugin a full no-op in public or otherwise excluded builds
- Preventing HTML injection, dashboard mounting, build rewrites, and UMD emission
- Disabling injection in publicly accessible builds
- Conditional tracing based on environment variables
- Testing with and without tracing enabled

#### `outputMode`

Seeds the initial AutoTracer output mode before your app runs when `inject` is enabled.

Use the canonical setting page for exact startup behavior and the runtime page for the meaning of each mode:

- https://docs.autotracer.dev/reference/build/react18/vite/config/outputMode
- https://docs.autotracer.dev/reference/runtime/react18/config/outputMode

#### `dashboardConfig`

Mounts the dashboard widget and injects its startup configuration when `inject` is enabled.

During `vite serve`, the plugin versions the dashboard module import for the lifetime of the development-server process. Restarting Vite loads the latest built dashboard package. Production builds retain the stable `@autotracer/dashboard` import, and multiple AutoTracer plugins still mount one shared widget.

Use these canonical pages for exact fields and recommended browser control workflow:

- https://docs.autotracer.dev/reference/build/react18/vite/config/dashboardConfig
- https://docs.autotracer.dev/dashboard/webapps
- https://docs.autotracer.dev/dashboard/reference

#### `prefix`

Adds a stable build-time label to injected component names, which is most useful when multiple islands or microfrontends share one browser console.

Use the canonical setting page for exact behavior and filtering rules:

- https://docs.autotracer.dev/reference/build/react18/vite/config/prefix

## Dev-only behavior

The plugin can be controlled in multiple ways:

- **`inject` parameter**: Set to `false` to disable injection programmatically
- **`TRACE_INJECT=0` environment variable**: Disables injection regardless of configuration
- **Public builds**: Use `inject: mode === "development"` or an explicit internal QA flag so tracing never ships in publicly accessible builds

## Mode vs. pragmas (precedence)

Use line comments to control component-level injection.

- `// @trace` enables one eligible component.
- `// @trace-disable` disables one eligible component.
- `include` and `exclude` decide the eligible set before pragma signals are applied.

For exact placement rules, precedence, and examples, see the canonical React pragma reference:

- https://docs.autotracer.dev/reference/build/react18/vite/pragmas

## Hook value labels

You can opt-in to labeling values returned from hooks for nicer console output:

```ts
reactTracer.vite({
  labelHooks: ["useState", "useReducer", "useSelector", "useAppSelector"],
});
```

This augments built-ins (useState/useReducer) by labeling identifiers assigned from matching hook calls.

## Theme File Support

The plugin automatically loads and injects theme files from your project root at build time, enabling personal color and icon customization without code changes.

### How It Works

The plugin searches for theme files in your project root directory:

1. **Base theme**: `*react-theme.json` (e.g., `react-theme.json`, `colorblind-react-theme.json`)
2. **Light mode override**: `*react-theme-light.json`
3. **Dark mode override**: `*react-theme-dark.json`

Found themes are automatically injected as `globalThis.__REACTTRACER_THEME__` before your app loads.

### Quick Example

Create `react-theme-light.json` in your project root:

```json
{
  "definitiveRender": {
    "icon": "🔄",
    "lightMode": { "text": "#0066cc" }
  },
  "error": {
    "icon": "❌",
    "lightMode": { "text": "#cc0000", "background": "#fff5f5" }
  }
}
```

Add to `.gitignore` for personal customization:

```gitignore
# Personal react tracer themes
*react-theme.json
*react-theme-light.json
*react-theme-dark.json
```

Restart your dev server to apply changes.

### Theme Priority

Themes merge in this order (later overrides earlier):

1. Built-in defaults
2. Programmatic config through the `colors` runtime option
3. Theme files (loaded by plugin)

This allows:

- **Project sets shared defaults**: use the `colors` runtime option in `reactTracer()`
- **Developer adds local override**: `my-react-theme-light.json` in `.gitignore`
- **Built-in defaults fill the rest**: categories you do not override still use the default theme

### Complete Guide

See the documentation site for the current theme reference and copyable examples:

- Theme API: https://docs.autotracer.dev/themes/react18/api
- Theme examples: https://docs.autotracer.dev/themes/react18/examples

## Monorepo / Workspace Builds

When a workspace library is compiled by the host app's Rollup pass, the injected
`import { useReactTracer } from "@autotracer/react18"` can't be resolved from the
library's own `package.json`, causing a build error.

**The right fix depends on how the library is consumed.**

### Source libraries (raw TypeScript) → `resolve.alias`

If the library is consumed as raw `.tsx` source (no `dist/`, `"noEmit": true`), use
`resolve.alias` in the host app to redirect `@autotracer/react18` to the host's
installed copy. React stays bundled normally; no UMD globals, no CSP risk.

```ts
// host-app/vite.config.ts
import { resolve } from "path";

export default defineConfig(({ mode }) => ({
  plugins: [
    reactTracer.vite({ inject: mode === "development" }),
    react(),
  ],
  resolve: {
    alias: {
      "@autotracer/react18": resolve(
        __dirname,
        "../../node_modules/@autotracer/react18",
      ),
    },
  },
}));
```

### Pre-built packages (with own `dist/`) → `buildWithWorkspaceLibs`

If the library has its own build step and the host app imports from `dist/`, use
`buildWithWorkspaceLibs: true`. This externalises React and `@autotracer/react18`
from the **entire app bundle** and loads them via injected `<script>` tags.

> ⚠️ **Side effect:** React is removed from your app bundle. If the injected scripts
> fail to load (CDN outage, CSP, network error) the whole app breaks.

```ts
// host-app/vite.config.ts
const isQA = process.env.DEPLOY_ENV === "qa";

export default defineConfig(({ mode }) => ({
  plugins: [
    reactTracer.vite({
      inject: mode === "development" || isQA,
      buildWithWorkspaceLibs: isQA, // only for pre-built workspace deps
    }),
    react(),
  ],
}));
```

> Do **not** use `buildWithWorkspaceLibs` for source libs — `resolve.alias` is
> simpler and has no bundle side-effects.

See the **[Monorepo Setup guide](https://docs.autotracer.dev/guide/monorepo)** for a full
decision tree, flowcharts, and the CSP / self-hosting walkthrough.

### What `buildWithWorkspaceLibs` does automatically

1. **Externalises** `@autotracer/react18`, `react`, and `react-dom` as UMD globals.
2. **Emits** the ReactTracer UMD build alongside your output.
3. **Injects `<script>` tags** in `index.html` to load React, ReactDOM, and ReactTracer
   before your app bundle.
4. **Creates the React DevTools hook** via an inline script so the tracer works in
   restricted internal QA deployments without the browser extension.

Applies to `vite build` only — `vite dev` is unaffected.

If `inject` is `false` or `TRACE_INJECT=0`, none of these build-time side effects run.

### Self-Hosting React UMD Files (CSP)

By default, `buildWithWorkspaceLibs` injects `<script>` tags pointing to **unpkg.com**.
If your CSP blocks external CDN requests, serve the files from your own origin.

**Step 1 — Copy UMD files to your public folder:**

```
node_modules/react/umd/react.production.min.js          → public/vendor/react.production.min.js
node_modules/react-dom/umd/react-dom.production.min.js  → public/vendor/react-dom.production.min.js
```

**Step 2 — Configure the plugin:**

```ts
reactTracer.vite({
  inject: isQA,
  buildWithWorkspaceLibs: isQA,
  reactUmdSrc: "/vendor/react.production.min.js",
  reactDomUmdSrc: "/vendor/react-dom.production.min.js",
});
```

## Security Considerations

### Do Not Enable in Publicly Accessible Deployments

The ReactTracer plugin should **never be enabled in publicly accessible deployments** for the following reasons:

1. **Information Disclosure** - The plugin injects code that logs component state, props, and render details to the browser console, potentially exposing:
   - User data and personal information (PII)
   - Authentication state and session details
   - Business logic and application structure
   - Internal component implementation details

2. **Performance Impact** - Instrumentation and tracing generate significant overhead that degrades user experience

3. **Bundle Size** - Injected hooks and tracing code increase your bundle size unnecessarily

4. **Attack Surface** - The DevTools hook and tracing infrastructure are accessible to anyone with console access

### Recommended Configuration

Always use environment-based configuration to disable the plugin in publicly accessible builds:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const isQA = process.env.DEPLOY_ENV === "qa";

  return {
    plugins: [
      reactTracer.vite({
        inject: isDev || isQA, // NEVER enable in publicly accessible builds
        include: {
          paths: ["src/**/*.tsx"],
        },
        exclude: {
          paths: ["**/*.spec.*", "**/*.test.*"],
        },
      }),
      react(),
    ],
  };
});
```

**For TEST/QA builds with workspace libraries:**

When using `buildWithWorkspaceLibs: true` in TEST/QA environments, ensure the plugin `inject` option is properly configured:

```tsx
// vite.config.ts - inject option controls whether tracing is enabled
const isQA = process.env.DEPLOY_ENV === "qa";

reactTracer.vite({
  inject: isQA, // Only inject in internal QA, not public builds
  buildWithWorkspaceLibs: isQA,
});
```

## React Server Components (RSC)

If you're using an RSC-enabled framework (like Next.js App Router), set `serverComponents: true` in the plugin options. When enabled, the transform will:

- Treat modules as Server Modules by default
- Only inject into modules that have the top-level directive:

  "use client";

This prevents injecting client-only hooks where they don't belong. All other transform rules (mode/include/exclude/pragma) still apply to Client Components.

## License

MIT © Carl Ribbegårdh
