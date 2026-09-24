# `labelHooksPattern`

**Package:** `@autotracer/plugin-babel-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"^use[A-Z].*"`

---

`labelHooksPattern` is a build configuration option passed to `@autotracer/plugin-babel-react19`. It supplies a regular-expression source string that matches additional hook names to label during injection.

Provide the pattern itself, not a JavaScript regex literal. The shared injector strips accidental leading and trailing `/` delimiters for convenience.

## Usage

```js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react19",
      { "labelHooksPattern": "^use[A-Z].*" }
    ]
  ]
}
```
