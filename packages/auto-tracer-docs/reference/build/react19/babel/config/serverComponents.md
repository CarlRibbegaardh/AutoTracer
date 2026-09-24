# `serverComponents`

**Package:** `@autotracer/plugin-babel-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`serverComponents` is a build configuration option passed to `@autotracer/plugin-babel-react19`. It turns on React Server Components safety checks.

When `true`, the plugin only transforms modules that contain a top-level `"use client"` directive. Files without that directive are left unchanged so client-only hooks are not injected into server code.

This package instruments client components through the Babel path. It does not trace React Server Component execution, and it does not cover server actions.

## Usage

```js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react19",
      {
        "serverComponents": true,
        "include": { "paths": ["app/**/*.tsx"] }
      }
    ]
  ]
}
```
