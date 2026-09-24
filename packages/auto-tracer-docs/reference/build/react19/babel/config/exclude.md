# `exclude`

**Package:** `@autotracer/plugin-babel-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `{ paths?: string[]; components?: Array<string | RegExp> }` &nbsp;·&nbsp; **Default:** test files, test folders, `node_modules`, `dist`, `build`, `.next`, and `coverage`

---

`exclude` is a build configuration option passed to `@autotracer/plugin-babel-react19`. It removes files and component names from the eligible set before pragma rules and `mode` fallback are applied.

The plugin normalizes this option through `@autotracer/inject-react19`, so nested fields are deep-merged with the defaults.

## Usage

```js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react19",
      {
        "exclude": {
          "components": ["DebugPanel", "StoryOnlyComponent"]
        }
      }
    ]
  ]
}
```
