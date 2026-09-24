# FlowTracer Theme API

`@autotracer/flow` supports theming in two places: Vite-injected theme files for the normal global runtime path, and the `theme` field in `createFlowTracer(logger, config?)` for the separate manual tracer path.

For normal app integrations, use Vite theme files. Use `createFlowTracer(logger, { theme })` only when you are already working on that internal manual-tracer path.

The `logger` argument on `createFlowTracer(logger, { theme })` comes from [@autotracer/logger](/api/logger), usually via `getLogger(name)`.

## Manual Theme Object

`createFlowTracer(logger, { theme })` accepts a `FlowThemeConfig` object.

Missing top-level categories fall back to `DEFAULT_FLOW_THEME` when the tracer instance is created.

If you replace one category manually, provide the fields you want for that category. The manual `theme` path does not deep-merge nested `lightMode`, `darkMode`, or `icon` values inside an individual category.

```ts
import { createFlowTracer } from "@autotracer/flow";
import { getLogger } from "@autotracer/logger";

const tracer = createFlowTracer(getLogger("App"), {
  theme: {
    functionEnter: {
      lightMode: { text: "#0055cc", bold: true },
      darkMode: { text: "#7dd3fc", bold: true },
      icon: "→",
    },
    exception: {
      darkMode: { text: "#ff6b6b", background: "#2f1c1c", bold: true },
      icon: "💥",
    },
  },
});
```

## Vite Theme Files

`@autotracer/plugin-vite-flow` loads theme files from the Vite root at build time and injects the merged result into `globalThis.__FLOWTRACER_THEME__` before the global FlowTracer installs.

FlowTracer searches in this order:

- `*flow-theme.json`
- `*flow-theme-light.json`
- `*flow-theme-dark.json`

If multiple files match one step, the first alphabetical match wins for that step.

The global tracer created by `@autotracer/flow` reads that injected theme and deep-merges it over `DEFAULT_FLOW_THEME`.

At runtime, FlowTracer selects the active `lightMode` or `darkMode` branch from your browser's [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme) preference.

## Important Distinction

FlowTracer currently has two separate theme setup paths:

- the normal global tracer uses the injected `__FLOWTRACER_THEME__` value when a build plugin provides it
- manual tracers use the `theme` object you pass to `createFlowTracer()`

If you are trying to theme the tracer used by a normal Vite app, this page usually means theme files, not `createFlowTracer()`.

## Category Shape

Each top-level category accepts the same structure:

```ts
type ThemeOptions = {
  background?: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
};

type ColorOptions = {
  lightMode?: ThemeOptions;
  darkMode?: ThemeOptions;
  icon?: string;
};
```

## Theme Categories

| Key              | Used for                                    | Default emphasis |
| ---------------- | ------------------------------------------- | ---------------- |
| `asyncStart`     | async function start messages               | `→`, bold        |
| `asyncComplete`  | async function completion messages          | `←`, bold        |
| `functionEnter`  | synchronous function entry                  | `→`, bold        |
| `functionExit`   | synchronous function exit with elapsed time | `←`, bold        |
| `parameter`      | parameter logging                           | italic           |
| `returnValue`    | return value logging                        | plain            |
| `exception`      | exception logging                           | `💥`, bold       |
| `runtimeControl` | start, stop, and runtime-control messages   | `🔧`, plain      |

For concrete JSON files you can copy into a Vite app, see [FlowTracer Example Themes](./examples). For the manual runtime `theme` setting itself, see [FlowTracer Runtime `theme`](/reference/runtime/flow/config/theme).
