# @autotracer/plugin-babel-react18

## Overview

`@autotracer/plugin-babel-react18` is the AutoTracer build-time plugin for React apps that already compile through Babel, including Next.js, Create React App, and custom Babel-based setups. It injects `useReactTracer()` and hook labeling during compilation so runtime traces stay readable without hand-editing your components.

## Why Use It

This package gives Babel-based apps automatic component and hook labeling without taking over runtime startup. The plugin owns build-time injection only, while your app bootstrap still decides when tracing starts, whether the Dashboard is mounted, and whether tracing stays dormant until you open a narrow capture window.

Recommended Babel path: use `@autotracer/plugin-babel-react18` for build-time injection, initialize `reactTracer()` before your client entry renders, and mount `@autotracer/dashboard` yourself when you want the standard browser control workflow in restricted internal builds. When the Dashboard is not mounted, use the lower-level `globalThis.autoTracer` runtime control surface.

## Installation

```bash
pnpm add @autotracer/react18
pnpm add -D @autotracer/plugin-babel-react18
```

If this internal browser app uses the Dashboard as its normal control surface, add it separately:

```bash
pnpm add -D @autotracer/dashboard
```

## Configuration

Add the plugin to your Babel configuration:

```json
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

To keep tracing out of publicly accessible production builds on the Babel path, exclude the plugin from the production Babel config itself:

```js
const shouldTrace =
  process.env.NODE_ENV === "development" ||
  process.env.INTERNAL_QA === "true";

module.exports = {
  plugins: [
    ...(shouldTrace
      ? [
          [
            "@autotracer/plugin-babel-react18",
            {
              mode: "opt-out",
            },
          ],
        ]
      : []),
  ],
};
```

On the Babel path, runtime gating alone is not enough. If the plugin stays enabled in a production build, Babel still injects `useReactTracer()` and hook labeling into compiled components.

Use these documentation pages for exact option behavior:

- React integration path: https://docs.autotracer.dev/guide/config-react
- Babel plugin settings: https://docs.autotracer.dev/reference/build/react18/babel/
- Babel pragma comments: https://docs.autotracer.dev/reference/build/react18/babel/pragmas
- Runtime settings: https://docs.autotracer.dev/reference/runtime/react18/
- Runtime API: https://docs.autotracer.dev/api/react18
- Dashboard workflow: https://docs.autotracer.dev/dashboard/webapps

Theme customization stays on the runtime side through `reactTracer({ colors })`. File-based theme loading is available only on the Vite plugin path through https://docs.autotracer.dev/themes/react18/api.

Keep this plugin out of publicly accessible builds. The intended use case is development and restricted internal test or QA environments.

## Usage

Add the plugin in Babel, then initialize the runtime separately before your client entry renders:

```tsx
const shouldTrace =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_INTERNAL_QA === "true";

async function bootstrap(): Promise<void> {
  if (shouldTrace) {
    const { reactTracer, isReactTracerInitialized } =
      await import("@autotracer/react18");

    if (!isReactTracerInitialized()) {
      reactTracer({
        enabled: false,
      });
    }
  }
}

void bootstrap();
```

Use the same environment decision for both the Babel plugin and the runtime bootstrap so internal builds get tracing and publicly accessible builds get neither injection nor runtime startup.

Use the guide that matches your actual entry path when you need full bootstrap examples:

- Next.js Pages Router: https://docs.autotracer.dev/guide/installation-react-nextjs-pages
- Next.js App Router: https://docs.autotracer.dev/guide/installation-react-nextjs-app
- Create React App: https://docs.autotracer.dev/guide/installation-react-cra

Use pragma comments when you want component-level control inside eligible files:

```tsx
// @trace
export function Counter() {
  return <button>Count</button>;
}
```

In browser-based internal web apps, the normal control surface is the Dashboard. On this Babel path, you mount it yourself. When the Dashboard is not mounted, use the lower-level `globalThis.autoTracer.reactTracer` API in tests, automation, and other non-Dashboard setups.

## License

MIT © Carl Ribbegårdh
