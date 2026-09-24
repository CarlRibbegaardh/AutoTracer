# `enabled`

**Package:** `@autotracer/dashboard` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Initializer:** `mountDashboard(config?)` &nbsp;·&nbsp; **Type:** `boolean`

---

`enabled` is a configuration field in the `DashboardConfig` shape used by `mountDashboard(config?)` in `@autotracer/dashboard` and reused by the Vite-plugin `dashboardConfig` setting.

When `false`, the dashboard widget does not mount. Passing `enabled: false` is functionally equivalent to omitting `dashboardConfig` entirely on the Vite path, or not calling `mountDashboard(...)` at all on the manual path.

The default is `true`. Omitting `enabled` always mounts the widget.

Read together with [`hideByDefault`](./hideByDefault), [`position`](./position), [`hotkeys`](./hotkeys), and the [Dashboard Package Reference](/dashboard/reference).

## Usage

On the Vite path, passing `enabled: false` skips all dashboard injection — the `@autotracer/dashboard` package is not bundled:

```typescript
reactTracer.vite({
  dashboardConfig: { enabled: false },
});
```

If [`inject`](../../reference/build/react18/vite/config/inject) is already `false` at the plugin level, the entire plugin is a no-op and dashboard injection is skipped regardless of `dashboardConfig`. You do not need to set both.

On the manual path, `mountDashboard({ enabled: false })` returns early without mounting. The package is already in the bundle because the caller imported it, so use a conditional import or guard the call to keep it out of the build entirely:

```typescript
const shouldMountDashboard =
  import.meta.env.DEV || import.meta.env.VITE_INTERNAL_QA === "true";

if (shouldMountDashboard) {
  mountDashboard();
}
```
