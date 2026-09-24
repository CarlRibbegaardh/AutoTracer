# `labelHooks`

**Package:** `@autotracer/plugin-babel-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string[]` &nbsp;·&nbsp; **Default:** `[]`

---

`labelHooks` is a build configuration option passed to `@autotracer/plugin-babel-react18` in your Babel config. It lists hook names that should always receive automatic labels.

These hook names are labeled even if they do not match [`labelHooksPattern`](./labelHooksPattern). Use this when you want to guarantee labels for a known set of hooks.

Read together with [`labelHooksPattern`](./labelHooksPattern) when you are tuning automatic hook labeling.

## Usage

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react18",
      { "labelHooks": ["useState", "useReducer", "useSelector"] }
    ]
  ]
}
```
