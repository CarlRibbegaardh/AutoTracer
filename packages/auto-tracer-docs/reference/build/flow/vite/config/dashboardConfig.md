# `dashboardConfig`

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** `undefined`

---

`dashboardConfig` is a build configuration option for `flowTracer()` — the Vite plugin initializer of the `@autotracer/plugin-vite-flow` Flow build-time instrumentation package. It mounts the dashboard widget automatically.

Provide `dashboardConfig` when you want the dashboard available in the browser without mounting it yourself.

If [`inject`](./inject) is `false`, the plugin does not apply this option. The `@autotracer/dashboard` package must also be installed explicitly.

Read together with [`inject`](./inject), [`runtimeControlled`](./runtimeControlled), and the [Dashboard Package Reference](/dashboard/reference).

## Default

If you omit `dashboardConfig`, the dashboard does not mount.

## Fields

- `enabled`: when `false`, the dashboard widget is not injected and the `@autotracer/dashboard` package is not bundled. Equivalent to omitting `dashboardConfig` entirely. Setting [`inject`](./inject)` false` at the plugin level also skips dashboard injection — you do not need to set both.
- `hideByDefault`: starts the widget hidden. Default `true`.
- `position`: places the widget in one of the four screen corners. Default `"bottom-right"`.
- `hotkeys.toggleTracing`: keyboard shortcut for tracing on and off. Default `"Alt+Shift+T"`.
- `hotkeys.toggleDashboard`: keyboard shortcut for showing and hiding the widget. Default `"Alt+Shift+D"`.

## Usage

To mount the dashboard with its default settings, pass an empty object.

```typescript
flowTracer({
  inject: isInternalBrowserBuild,
  dashboardConfig: {},
});
```

To override dashboard behavior, pass the fields you need.

```typescript
flowTracer({
  inject: isInternalBrowserBuild,
  dashboardConfig: {
    hideByDefault: true,
    position: "bottom-right",
  },
});
```
