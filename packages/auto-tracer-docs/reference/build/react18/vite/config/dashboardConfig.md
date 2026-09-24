# `dashboardConfig`

**Package:** `@autotracer/plugin-vite-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** `undefined`

---

`dashboardConfig` is a build configuration option for `reactTracer.vite()` — the Vite plugin initializer of the `@autotracer/plugin-vite-react18` React build-time injection package. It tells the plugin to inject dashboard configuration into the page and mount the dashboard widget automatically.

Use this for browser-based internal web apps when you want the [Dashboard workflow](/dashboard/webapps) as the normal control surface. The dashboard controls the tracer runtime, but trace output still goes to the browser's normal logging surface.

The shared dashboard labels this control `ReactTracer`. It uses the same version-neutral React control surface as the React 19 integration.

The plugin only applies this option when [`inject`](./inject) is enabled. The `@autotracer/dashboard` package must also be installed explicitly.

If [`inject`](./inject) is `false`, the plugin is a full no-op. In that case, `dashboardConfig` is ignored: the plugin does not inject dashboard configuration and does not mount the dashboard widget.

Read together with [`inject`](./inject), [`outputMode`](./outputMode), and the [Dashboard Package Reference](/dashboard/reference).

## Fields

- `enabled`: when `false`, the dashboard widget is not injected and the `@autotracer/dashboard` package is not bundled. Equivalent to omitting `dashboardConfig` entirely. Setting [`inject`](./inject)` false` at the plugin level also skips dashboard injection — you do not need to set both.
- `hideByDefault`: starts the widget hidden. Default `true`.
- `position`: places the widget in one of the four screen corners. Default `"bottom-right"`.
- `hotkeys.toggleTracing`: keyboard shortcut for tracing on and off. Default `"Alt+Shift+T"`.
- `hotkeys.toggleDashboard`: keyboard shortcut for showing and hiding the widget. Default `"Alt+Shift+D"`.

## Usage

To mount the dashboard with its default settings, pass an empty object.

```typescript
reactTracer.vite({
  inject: true,
  dashboardConfig: {},
});
```

In real internal browser builds, guard `inject` for the builds where the plugin should run. `dashboardConfig` can stay configured; when `inject` is `false`, the plugin ignores it because the whole plugin is disabled.

```typescript
export default defineConfig(({ mode }) => {
  const isInternalBrowserBuild = mode === "development";

  return {
    plugins: [
      reactTracer.vite({
        inject: isInternalBrowserBuild,
        dashboardConfig: {
          hideByDefault: true,
          position: "bottom-right",
        },
      }),
    ],
  };
});
```
