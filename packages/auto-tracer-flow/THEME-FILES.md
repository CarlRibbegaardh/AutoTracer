# FlowTracer Theme Files

Use theme files in a Vite project when you want visual overrides without changing startup code. They are loaded by `@autotracer/plugin-vite-flow` from the Vite project root, so restart the dev server after changing them.

## What They Change

Theme files apply to the global tracer installed by `@autotracer/flow`. The global tracer deep-merges file-based overrides over its default theme, which makes theme files a good fit for local developer overrides or environment-specific presentation tweaks.

If you are creating your own tracer with `createFlowTracer(logger, config)`, use the manual `theme` object instead. Theme files are the Vite-plugin path for the global tracer, not the manual tracer path.

## Theme File Names

- `*flow-theme.json`: base overrides for both light and dark mode
- `*flow-theme-light.json`: light-mode overrides
- `*flow-theme-dark.json`: dark-mode overrides

If the files are personal overrides, keep them out of git:

```gitignore
# Personal flow tracer themes
*flow-theme.json
*flow-theme-light.json
*flow-theme-dark.json
```

## When To Use What

- Use manual `theme` when you create your own tracer with `createFlowTracer(logger, config)`.
- Use theme files when you want local file-based overrides for the global tracer in a Vite app.
- Use `@autotracer/plugin-vite-flow` when you want those files loaded automatically.

## Reference

For theme categories, load order, and copyable examples:

- FlowTracer Theme API: https://docs.autotracer.dev/themes/flow/api
- FlowTracer Theme examples: https://docs.autotracer.dev/themes/flow/examples
- FlowTracer configuration: https://docs.autotracer.dev/guide/config-flow
- Vite plugin API: https://docs.autotracer.dev/api/plugin-vite-flow
