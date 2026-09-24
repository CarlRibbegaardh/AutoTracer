# Monorepo Setup

Using AutoTracer in a pnpm / Turborepo monorepo requires a little extra care because Rollup resolves package imports from the **importer's own `package.json`**, not from the monorepo root.
When the AutoTracer Vite plugin injects `import { useReactTracer } from "@autotracer/react18"` into a workspace library that doesn't declare that dependency, the build fails.

The right fix depends entirely on **how the library is consumed by the host app**.

## Decision Tree

```
Is the workspace library consumed as raw TypeScript source
(the host app's Rollup pass compiles it)?
│
├─ YES → use resolve.alias  (source lib)
│
└─ NO  → Does the library have a pre-built dist/ output?
         ├─ YES → use buildWithWorkspaceLibs  (pre-built package)
         └─ NO  → build the library first, then choose the pre-built path
```

---

## Scenario A — Source Library (`resolve.alias`)

A **source library** is a workspace package whose TypeScript files are compiled **by the host app's build**.
The package's `tsconfig.json` typically has `"noEmit": true`, and its `package.json` `exports` field points directly to the TypeScript source (e.g. `"main": "src/index.ts"`), so the host app's Rollup pass compiles it as part of its own build.

### Why `resolve.alias` is the right tool

Rollup uses the importer's `node_modules` to resolve imports. A source library does not have its own `node_modules`, so Rollup looks in the host app's `node_modules` instead — and `@autotracer/react18` is usually installed there.

Adding a `resolve.alias` tells Vite/Rollup to rewrite the `@autotracer/react18` import to the host app's copy **before Rollup even touches the library file**.
Result: the injection works, React stays bundled normally, and **there is zero runtime impact** (no extra script tags, no UMD globals, no CSP risk).

### Configuration

```ts
// host-app/vite.config.ts
import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig(({ mode }) => ({
  plugins: [
    reactTracer.vite({
      inject: mode === "development",
      mode: "opt-out",
    }),
    react(),
  ],

  resolve: {
    alias: {
      // Redirect @autotracer/react18 imports inside workspace libs
      // to the host app's installed copy.
      "@autotracer/react18": resolve(
        __dirname,
        "../../node_modules/@autotracer/react18",
      ),
    },
  },
}));
```

::: tip Monorepo root `node_modules`
In a hoisted workspace, the package is usually installed at the **root** `node_modules`.
Adjust the path above if your workspace uses a different hoisting strategy.
:::

### Flowchart

```
pnpm workspace monorepo
├── packages/
│   └── ui-lib/         ← source lib (noEmit TS, no dist/)
│       └── src/Button.tsx
└── apps/
    └── host-app/       ← compiles everything
        └── vite.config.ts
              │
              ├── resolve.alias: "@autotracer/react18" → root/node_modules/...
              │
              └── plugin injects useReactTracer into Button.tsx
                  ↓ Rollup sees "@autotracer/react18" → alias rewrites it
                  ↓ React stays in the normal bundle ✔
```

---

## Scenario B — Pre-built Package (`buildWithWorkspaceLibs`)

A **pre-built package** is a workspace package that runs its own Rollup / library-mode Vite build and produces a `dist/` directory. The host app imports from `dist/`, not from `src/`.

Because the library is compiled **independently**, the AutoTracer plugin runs during the **library's own build** — not during the host app's build.
The plugin injects `import { useReactTracer } from "@autotracer/react18"` into the library source and then **externalises** `@autotracer/react18` from the library's own bundle.
The library's `dist/` therefore contains a bare `import "@autotracer/react18"` that the _host app_ must satisfy at runtime.

`buildWithWorkspaceLibs: true` in the **host app** makes Rollup satisfy that bare import by treating `@autotracer/react18` (and React itself) as UMD globals, loading them via injected `<script>` tags.

### ⚠️ Side Effects of `buildWithWorkspaceLibs`

Enabling this flag has a significant side effect: **React is removed from your entire app bundle**.
`rollup-plugin-external-globals` replaces every `react` and `react-dom` import in the whole build with `window.React` / `window.ReactDOM`.
If the injected `<script>` tags fail to load for any reason (CDN outage, CSP, network error), the whole app breaks — not just the tracer.

Plan for this explicitly:
- Self-host the UMD files (see [CSP and Self-Hosting](#csp-and-self-hosting) below).
- Add a `<noscript>` fallback or health-check if you require high availability.

### Configuration

```ts
// host-app/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";

const isQA = process.env.DEPLOY_ENV === "qa";

export default defineConfig(({ mode }) => ({
  plugins: [
    reactTracer.vite({
      inject: mode === "development" || isQA,
      mode: "opt-out",

      // Externalise React + @autotracer/react18 from the app bundle
      // and load them as UMD globals. Required when the workspace lib
      // is a pre-built package with @autotracer/react18 already
      // externalised from its own dist/.
      buildWithWorkspaceLibs: isQA,
    }),
    react(),
  ],
}));
```

### Flowchart

```
pnpm workspace monorepo
├── packages/
│   └── ui-lib/         ← pre-built package (has its own build step)
│       ├── src/Button.tsx
│       └── dist/Button.js  ← imports window.ReactTracer global (externalised)
└── apps/
    └── host-app/
        └── vite.config.ts
              │
              └── buildWithWorkspaceLibs: true
                    ↓
                    rollup-plugin-external-globals removes React from bundle
                    ↓
                    <script> tags injected into index.html:
                      react.production.min.js  (window.React)
                      react-dom.production.min.js  (window.ReactDOM)
                      autotracer-react18.umd.js  (window.ReactTracer)
```

---

## CSP and Self-Hosting

By default, `buildWithWorkspaceLibs` injects `<script>` tags pointing to **unpkg.com**.
If your Content Security Policy blocks external CDN requests, serve the files from your own origin instead.

**Step 1 — Copy the UMD files to your public folder:**

```
node_modules/react/umd/react.production.min.js
  → public/vendor/react.production.min.js

node_modules/react-dom/umd/react-dom.production.min.js
  → public/vendor/react-dom.production.min.js
```

**Step 2 — Configure the plugin:**

```ts
// vite.config.ts
reactTracer.vite({
  inject: isQA,
  buildWithWorkspaceLibs: isQA,
  reactUmdSrc: "/vendor/react.production.min.js",
  reactDomUmdSrc: "/vendor/react-dom.production.min.js",
});
```

Paths are injected as-is; use absolute paths (`/vendor/...`) or paths your server resolves correctly.

::: warning Pinning versions
The UMD files you copy must match the React version your app uses. Re-copy them after upgrading React.
:::

---

## Quick Reference

| Scenario | Library type | Fix | React in bundle? |
|---|---|---|---|
| Source lib (raw `.tsx`) | `noEmit` TS, no `dist/` | `resolve.alias` | ✅ Yes (normal) |
| Pre-built package | Has `dist/` with externals | `buildWithWorkspaceLibs` | ❌ No (UMD global) |

::: danger Do not use `buildWithWorkspaceLibs` for source libs
Using `buildWithWorkspaceLibs` when a `resolve.alias` would suffice removes React from your bundle unnecessarily and introduces a CDN / CSP dependency with no benefit.
:::

---

## See Also

- [ReactTracer Options](/guide/config-react) — full configuration reference
- [Production Deployment](/best-practices/production) — keeping tracing out of publicly accessible builds
- [Common Pitfalls](/best-practices/pitfalls) — other setup mistakes
- [Security Considerations](/best-practices/security) — CSP and similar concerns
