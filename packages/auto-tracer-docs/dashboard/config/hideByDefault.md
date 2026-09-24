# `hideByDefault`

**Package:** `@autotracer/dashboard` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Initializer:** `mountDashboard(config?)` &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `true`

---

`hideByDefault` is a configuration field in the `DashboardConfig` shape used by `mountDashboard(config?)` in `@autotracer/dashboard` and reused by the Vite-plugin `dashboardConfig` setting. It controls whether the widget starts hidden on the first unseen load.

If the dashboard was already marked as shown in a previous browser session, that saved state wins and the widget starts visible even when `hideByDefault` is `true`.

Starting tracing from the dashboard UI or from the shared tracing hotkey marks the widget as shown and makes it visible. Manual `show()` and `toggle()` calls change current visibility, but they do not persist that shown-before state.

Read together with [`enabled`](./enabled), [`hotkeys`](./hotkeys), and the [Dashboard Package Reference](/dashboard/reference).

## Usage

The widget starts hidden by default. Set `hideByDefault: false` to make it visible immediately on every first load.

```typescript
mountDashboard({
  hideByDefault: false,
});
```
