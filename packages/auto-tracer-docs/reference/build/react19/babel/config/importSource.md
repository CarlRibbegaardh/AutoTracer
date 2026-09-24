# `importSource`

**Package:** `@autotracer/plugin-babel-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"@autotracer/react19"`

---

`importSource` is a build configuration option passed to `@autotracer/plugin-babel-react19`. It changes the module specifier used for injected `useReactTracer` and `labelState` imports.

## Usage

```js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react19",
      { "importSource": "@autotracer/react19" }
    ]
  ]
}
```
