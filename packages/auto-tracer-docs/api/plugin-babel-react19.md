# @autotracer/plugin-babel-react19

Build-time React 19 instrumentation for Babel-driven applications. Use this package in local development or restricted internal test and QA builds when your client build runs through Babel and you want AutoTracer to inject `useReactTracer()` and hook labels during compilation.

## Recommended Setup

Use the Babel plugin only in the builds where tracing is allowed, and initialize `reactTracer()` separately before the client application renders.

For browser-based internal apps, the [Dashboard workflow](/dashboard/webapps) is the preferred control surface. This package does not mount the Dashboard for you, so initialize the runtime in a dormant state and mount the Dashboard separately when your app uses it.

```tsx
async function bootstrap(): Promise<void> {
  const { isReactTracerInitialized, reactTracer } = await import(
    "@autotracer/react19"
  );

  if (!isReactTracerInitialized()) {
    reactTracer({ enabled: false });
  }
}

void bootstrap();
```

Exclude the plugin from public-facing builds. Runtime suppression is not a substitute because leaving the plugin enabled still injects tracing code.

## Package API

This package is consumed as a Babel plugin entry in Babel configuration:

```js
plugins: [["@autotracer/plugin-babel-react19", options]];
```

Use the build reference for the exact option behavior:

- [React 19 Babel settings](/reference/build/react19/babel/)
- [`outputMode`](/reference/build/react19/babel/config/outputMode)
- [`mode`](/reference/build/react19/babel/config/mode)
- [`include`](/reference/build/react19/babel/config/include)
- [`exclude`](/reference/build/react19/babel/config/exclude)
- [`labelHooks`](/reference/build/react19/babel/config/labelHooks)
- [`labelHooksPattern`](/reference/build/react19/babel/config/labelHooksPattern)
- [`serverComponents`](/reference/build/react19/babel/config/serverComponents)
- [`importSource`](/reference/build/react19/babel/config/importSource)
- [`prefix`](/reference/build/react19/babel/config/prefix)

## What The Plugin Owns

- build-time component injection through `@autotracer/inject-react19`
- optional output-mode seeding inside instrumented modules
- Babel parser reuse so the transformed module is reparsed without running the full Babel pipeline twice

This package does not initialize `@autotracer/react19`, does not mount `@autotracer/dashboard`, and does not load theme files.

## Next.js And React Server Components

For a Next.js App Router source tree, this package supports client-component instrumentation only through the Babel build path.

Set [`serverComponents`](/reference/build/react19/babel/config/serverComponents) when you want the transform to instrument only modules with a top-level `"use client"` directive.

That boundary is narrow:

- client components are covered when Babel executes this plugin
- native Turbopack injection is not covered
- React Server Component execution is not traced
- server actions are not covered

## Runtime And Browser Control

In internal browser apps, mount the [Dashboard workflow](/dashboard/webapps) separately when you want the normal browser control surface. When the Dashboard is not mounted, use `globalThis.autoTracer` after runtime initialization.

Theme-file loading belongs to the Vite plugin path. On the Babel path, theme customization stays on the runtime side through the `colors` option in `reactTracer()`.

## Pragmas

This package honors the shared React build pragmas:

- `// @trace`
- `// @trace-disable`

Use [React 19 Babel pragma comments](/reference/build/react19/babel/pragmas) for placement rules and precedence.

## Related Docs

- [@autotracer/react19](/api/react19) for runtime APIs and `globalThis.autoTracer`
- [@autotracer/plugin-vite-react19](/api/plugin-vite-react19) for the Vite build path
- [@autotracer/inject-react19](/api/inject-react19) for the shared low-level transform
