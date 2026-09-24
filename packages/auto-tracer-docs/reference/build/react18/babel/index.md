# ReactTracer Babel Plugin Settings

**Package:** `@autotracer/plugin-babel-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** Overview

---

Use this page for the build-time settings passed to `@autotracer/plugin-babel-react18` in your Babel config.

This layer controls build-time component injection, automatic hook labeling, React Server Components safety checks, and optional output-mode startup seeding. It does not replace the runtime `reactTracer()` initializer in `@autotracer/react18`, and it does not mount the Dashboard for you.
Theme customization stays on the runtime side through [`colors`](/reference/runtime/react18/config/colors). File-based theme loading is available only on the Vite plugin path through [ReactTracer Theme API](/themes/react18/api).

## Recommended Setup

Use `@autotracer/plugin-babel-react18` for build-time injection only in local development or restricted internal builds, and initialize `reactTracer()` before your client entry renders only in those same builds.

In restricted internal browser builds, mount `@autotracer/dashboard` yourself when you want the standard browser control workflow. When the Dashboard is not mounted, use the lower-level runtime control surface on [`globalThis.autoTracer`](/api/react18#runtime-control-global-api).

## Settings By Concern

- Startup and browser control: [`outputMode`](./config/outputMode)
- Eligibility and labeling: [`mode`](./config/mode), [pragma comments](./pragmas), [`include`](./config/include), [`exclude`](./config/exclude), [`labelHooks`](./config/labelHooks), [`labelHooksPattern`](./config/labelHooksPattern), and [`prefix`](./config/prefix)
- Framework and build wiring: [`serverComponents`](./config/serverComponents) and [`importSource`](./config/importSource)

## Adjacent Docs

- [@autotracer/plugin-babel-react18](/api/plugin-babel-react18) for package usage and current option coverage
- [Installation - ReactTracer with Next.js Pages Router](/guide/installation-react-nextjs-pages) for the Pages Router entry path
- [Installation - ReactTracer with Next.js App Router](/guide/installation-react-nextjs-app) for the App Router entry path
- [ReactTracer Installation - Create React App](/guide/installation-react-cra) for the Create React App entry path
- [ReactTracer Configuration](/guide/config-react) for the recommended runtime and build-time split
- [ReactTracer Runtime Settings](/reference/runtime/react18/) for `reactTracer()` option behavior
- [@autotracer/react18](/api/react18) for runtime APIs and the lower-level `globalThis.autoTracer` control surface

## Pragmas

Use line comments to control component-level injection.

- `// @trace` enables one eligible component.
- `// @trace-disable` disables one eligible component.
- `include` and `exclude` decide the eligible set before pragma signals are applied.

For exact placement rules, precedence, and examples, see [Pragma Comments](./pragmas).
