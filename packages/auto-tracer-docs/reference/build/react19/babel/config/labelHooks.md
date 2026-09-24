# `labelHooks`

**Package:** `@autotracer/plugin-babel-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string[]` &nbsp;·&nbsp; **Default:** `[]`

---

`labelHooks` is a build configuration option passed to `@autotracer/plugin-babel-react19`. It lists hook names whose returned values should always receive AutoTracer labels in injected components.

## Usage

```js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react19",
      { "labelHooks": ["useState", "useReducer", "useSelector"] }
    ]
  ]
}
```
