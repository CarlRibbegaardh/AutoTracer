# `serverComponents`

**Package:** `@autotracer/plugin-babel-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`serverComponents` is a build configuration option passed to `@autotracer/plugin-babel-react18` in your Babel config. It turns on React Server Components safety checks.

When `true`, the plugin only transforms modules that contain the `"use client"` directive. Files without that directive are left unchanged so client-only hooks are not injected into server code.

The default is `false`, so the plugin does not require `"use client"` unless you enable this safeguard.

Read together with [`include`](./include) and [`mode`](./mode) when you are configuring App Router style React projects or other RSC-aware builds.

## When To Set It

- Leave the default when your build is not using React Server Components.
- Set `true` when client and server modules coexist and you need the plugin to skip files that are not marked with `"use client"`.

## Usage

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react18",
      {
        "serverComponents": true,
        "include": {
          "paths": ["app/**/*.tsx"]
        }
      }
    ]
  ]
}
```
