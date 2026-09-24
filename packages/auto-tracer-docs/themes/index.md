# Themes

AutoTracer has separate theme APIs for ReactTracer and FlowTracer.

Use the library-specific page for the tracer you are configuring:

- [ReactTracer Theme API For React 18](./react18/api)
- [ReactTracer Example Themes For React 18](./react18/examples)
- [ReactTracer Theme API For React 19](./react19/api)
- [ReactTracer Example Themes For React 19](./react19/examples)
- [FlowTracer Theme API](./flow/api)
- [FlowTracer Example Themes](./flow/examples)

## Common Shape

Both libraries use the same per-category structure:

```ts
type ThemeOptions = {
  background?: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
};

type ColorOptions = {
  lightMode?: ThemeOptions;
  darkMode?: ThemeOptions;
  icon?: string;
};
```

## Theme Files

When you use the Vite plugins, theme files belong in the Vite project root. In a typical app, that is the same folder as `vite.config.ts` and `package.json`, not `src/`.

- ReactTracer files: `*react-theme.json`, `*react-theme-light.json`, `*react-theme-dark.json`
- FlowTracer files: `*flow-theme.json`, `*flow-theme-light.json`, `*flow-theme-dark.json`

If multiple files match one step, the first alphabetical match wins for that step.

## Setup Paths

ReactTracer combines built-in defaults, programmatic `colors`, and Vite-injected theme files.

FlowTracer has two separate theme paths:

- manual tracer configuration through `createFlowTracer(logger, { theme })`
- Vite-injected theme files for the global tracer installed by `@autotracer/flow`

The repository also ships ready-made example theme JSON files in the top-level `themes/` folder.
