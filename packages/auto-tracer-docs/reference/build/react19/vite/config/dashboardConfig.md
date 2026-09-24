# `dashboardConfig`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** `undefined`

---

`dashboardConfig` is a build configuration option for `reactTracer.vite()`. It tells the React 19 Vite plugin to inject Dashboard configuration into the page and mount `@autotracer/dashboard` automatically.

Use this for browser-based internal apps when you want the [Dashboard workflow](/dashboard/webapps) as the normal control surface.

The shared dashboard labels this control `ReactTracer`. It uses the same version-neutral React control surface as the React 18 integration.

The plugin applies this option only when [`inject`](./inject) is enabled. The plugin still does not initialize `@autotracer/react19` for you, so initialize the runtime separately before React renders. A dormant startup such as `reactTracer({ enabled: false })` is the usual pairing when the Dashboard should decide when tracing starts.

## Fields

- `enabled`: when `false`, the plugin does not inject the Dashboard configuration or mount script
- `hideByDefault`: passes through to the Dashboard package
- `position`: passes through to the Dashboard package
- `hotkeys.toggleTracing`: passes through to the Dashboard package
- `hotkeys.toggleDashboard`: passes through to the Dashboard package

Field-level defaults belong to `@autotracer/dashboard` rather than this plugin page.

## Usage

```ts
reactTracer.vite({
  inject: true,
  dashboardConfig: {
    enabled: true,
    hideByDefault: false,
    position: "bottom-right",
  },
});
```
