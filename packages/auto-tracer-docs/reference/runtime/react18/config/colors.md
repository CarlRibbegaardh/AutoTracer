# `colors`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** built-in theme

---

`colors` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It customizes the theme and styling used for different render-output categories.

The active `lightMode` or `darkMode` branch is selected automatically from your browser's [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme) preference.

A partial `colors` object is deep-merged over the built-in theme instead of replacing it.

If you use `@autotracer/plugin-vite-react18`, theme files can also populate this theme automatically at build time. See [ReactTracer Theme API](/themes/react18/api) and [ReactTracer Example Themes](/themes/react18/examples).

If both are present, programmatic `colors` sets the project default and the injected theme files can override overlapping values locally.

Read together with [`enabled`](./enabled) and [`outputMode`](./outputMode) when you are tuning startup behavior and output appearance.

## Shape

- Top-level keys include `definitiveRender`, `propInitial`, `propChange`, `stateInitial`, `stateChange`, `logStatements`, `warnStatements`, `errorStatements`, `reconciled`, `skipped`, `identicalStateValueWarning`, `identicalPropValueWarning`, and `other`.
- Each category accepts `lightMode`, `darkMode`, and `icon`.
- `lightMode` and `darkMode` accept `background`, `text`, `bold`, and `italic`.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({
  colors: {
    definitiveRender: {
      lightMode: { text: "#0055cc", bold: true },
      darkMode: { text: "#7dd3fc", bold: true },
    },
  },
});
```
