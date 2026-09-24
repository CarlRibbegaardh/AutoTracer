# `prefix`

**Package:** `@autotracer/plugin-babel-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** none

---

`prefix` is a build configuration option passed to `@autotracer/plugin-babel-react19`. It prepends a stable string to each injected component name so multiple React 19 entry points can stay distinguishable in one browser tab.

## Usage

```js
{
  "plugins": [
    ["@autotracer/plugin-babel-react19", { "prefix": "CheckoutShell" }]
  ]
}
```
