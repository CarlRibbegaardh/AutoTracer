# `include`

**Package:** `@autotracer/plugin-babel-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `{ paths?: string[]; components?: Array<string | RegExp> }` &nbsp;·&nbsp; **Default:** `paths: ["**/*.{tsx,jsx}"], components: []`

---

`include` is a build configuration option passed to `@autotracer/plugin-babel-react19`. It narrows which files and component names are eligible for injection before pragma rules and `mode` fallback are applied.

The plugin normalizes this option through `@autotracer/inject-react19`, so nested fields are deep-merged with the defaults.

## Usage

```js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react19",
      {
        "include": {
          "paths": ["src/**/*.tsx"],
          "components": ["App"]
        }
      }
    ]
  ]
}
```
