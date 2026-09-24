# @autotracer/plugin-babel-react18

**Babel plugin for automatic React component tracing (Next.js, CRA, Webpack).**

Build-time plugin that injects `useReactTracer()` into eligible React components during Babel compilation so AutoTracer can attach readable component and hook labels without manual instrumentation.

## Recommended Setup

Use `@autotracer/plugin-babel-react18` for build-time injection only in local development or restricted internal builds, and initialize `reactTracer()` before your client entry renders only in those same builds.

In restricted internal browser builds, mount `@autotracer/dashboard` yourself when you want the standard browser control workflow. When the Dashboard is not mounted, use the lower-level runtime control surface on [`globalThis.autoTracer`](/api/react18#runtime-control-global-api).

Theme customization stays on the runtime side through [`colors`](/reference/runtime/react18/config/colors). File-based theme loading is available only on the Vite plugin path through [ReactTracer Theme API](/themes/react18/api).

## Installation

```bash
# Install runtime and plugin
pnpm add @autotracer/react18
pnpm add -D @autotracer/plugin-babel-react18

# Using npm
npm install @autotracer/react18
npm install --save-dev @autotracer/plugin-babel-react18

# Using yarn
yarn add @autotracer/react18
yarn add -D @autotracer/plugin-babel-react18
```

If this internal browser app uses the Dashboard as its normal control surface, add it separately:

```bash
pnpm add -D @autotracer/dashboard
```

## Usage

Add the package to your Babel config:

```javascript
// babel.config.js or .babelrc
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react18",
      {
        "mode": "opt-out"
      }
    ]
  ]
}
```

Initialize the runtime separately before your client entry renders:

```typescript
async function bootstrap(): Promise<void> {
  const { reactTracer, isReactTracerInitialized } = await import(
    "@autotracer/react18"
  );

  if (!isReactTracerInitialized()) {
    reactTracer({
      enabled: false,
    });
  }
}

void bootstrap();
```

Use the framework guide that matches your entry path when you need full bootstrap examples:

- [Installation - ReactTracer with Next.js Pages Router](/guide/installation-react-nextjs-pages)
- [Installation - ReactTracer with Next.js App Router](/guide/installation-react-nextjs-app)
- [ReactTracer Installation - Create React App](/guide/installation-react-cra)
- [ReactTracer Configuration](/guide/config-react)

## Package API

This package is consumed as a Babel plugin entry in your Babel configuration. It is not a runtime initializer.

```javascript
plugins: [["@autotracer/plugin-babel-react18", options]];
```

### Supported Option Surface

- Startup and browser control: [`outputMode`](/reference/build/react18/babel/config/outputMode)
- Eligibility and labeling: [`mode`](/reference/build/react18/babel/config/mode), [pragma comments](/reference/build/react18/babel/pragmas), [`include`](/reference/build/react18/babel/config/include), [`exclude`](/reference/build/react18/babel/config/exclude), [`labelHooks`](/reference/build/react18/babel/config/labelHooks), [`labelHooksPattern`](/reference/build/react18/babel/config/labelHooksPattern), and [`prefix`](/reference/build/react18/babel/config/prefix)
- Framework and build wiring: [`serverComponents`](/reference/build/react18/babel/config/serverComponents) and [`importSource`](/reference/build/react18/babel/config/importSource)

### What This Package Changes

- Injects `useReactTracer()` into eligible React function components
- Labels values returned from supported hooks so trace output keeps source-level names
- Applies `mode`, `include`, `exclude`, and pragma rules before instrumentation
- Restricts instrumentation to client modules with `"use client"` when `serverComponents` is enabled
- Seeds the initial runtime `outputMode` once per page load when `outputMode` is configured

## Pragmas

Use line comments to control component-level injection.

- `// @trace` enables one eligible component.
- `// @trace-disable` disables one eligible component.
- `include` and `exclude` decide the eligible set before pragma signals are applied.

For exact placement rules, precedence, and examples, see the [canonical Babel pragma reference](/reference/build/react18/babel/pragmas).

## Related Docs

- [ReactTracer Babel Plugin Settings](/reference/build/react18/babel/) for the canonical per-setting reference
- [ReactTracer Runtime Settings](/reference/runtime/react18/) for `reactTracer()` option behavior
- [@autotracer/react18](/api/react18) for runtime APIs and the lower-level `globalThis.autoTracer` control surface
- [@autotracer/plugin-vite-react18](/api/plugin-vite-react18) for the Vite build path
- [Quick Start Guide](/guide/quickstart-react) for the recommended React entry flow
