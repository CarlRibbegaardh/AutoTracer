# ReactTracer Shared Transform

**Package:** `@autotracer/inject-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** Overview

---

Use this page for the low-level build-time transform shared by the ReactTracer Vite and Babel plugins.

This package owns the shared AST transform, the shared transform configuration, and helper APIs for tool authors. It does not initialize `reactTracer()`, it does not expose `globalThis.autoTracer` APIs, and it does not load theme files.

## Normal Integration

Use [`@autotracer/plugin-vite-react18`](/api/plugin-vite-react18) or [`@autotracer/plugin-babel-react18`](/api/plugin-babel-react18) for normal app integrations.

Use `@autotracer/inject-react18` directly only when you are authoring custom build tooling and you need direct control over `transform()` and `normalizeConfig()`.

## Settings By Concern

- Eligibility and precedence: [`mode`](./config/mode), [`include`](./config/include), and [`exclude`](./config/exclude)
- Framework and import wiring: [`serverComponents`](./config/serverComponents) and [`importSource`](./config/importSource)
- Hook labeling: [`labelHooks`](./config/labelHooks) and [`labelHooksPattern`](./config/labelHooksPattern)

## Adjacent Context Surface

Custom tooling can also pass `componentPrefix` through `TransformContext` when multiple islands, micro-frontends, or other independent React entry points share one browser tab and you need injected component names to stay distinguishable as `prefix:ComponentName`.

Use [@autotracer/inject-react18](/api/inject-react18) for the exact `TransformContext` shape.

## Surface Inventory

- Shared transform config: `mode`, `include`, `exclude`, `serverComponents`, `importSource`, `labelHooks`, and `labelHooksPattern`
- Adjacent context field: `TransformContext.componentPrefix`
- Transform entry points: `transform()`, `normalizeConfig()`, and `DEFAULT_CONFIG`
- Filtering helpers: `shouldProcessFile()`, `shouldInstrumentComponent()`, and `matchesPattern()`
- Detection helpers and types: `isComponentFunction()`, `extractComponentInfo()`, `hasExistingUseReactTracerImport()`, `TransformConfig`, `TransformContext`, `TransformResult`, and `ComponentInfo`
- Non-owned surfaces: runtime initializer settings, `globalThis.autoTracer` APIs, Dashboard control, and theme-file loading

## Adjacent Docs

- [@autotracer/inject-react18](/api/inject-react18) for the exported helper API surface
- [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/) for the Vite-owned integration path
- [ReactTracer Babel Plugin Settings](/reference/build/react18/babel/) for the Babel-owned integration path
- [ReactTracer Runtime Settings](/reference/runtime/react18/) for `reactTracer()` option behavior
- [@autotracer/react18](/api/react18) for runtime APIs and `globalThis.autoTracer`
