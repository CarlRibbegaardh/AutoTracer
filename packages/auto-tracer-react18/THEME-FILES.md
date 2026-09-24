# ReactTracer Theme Files

Use theme files in a Vite project when you want visual overrides without changing startup code.

Theme files are loaded by `@autotracer/plugin-vite-react18`.

Place them in the Vite project root.

Restart the dev server after changing them.

## What They Change

Theme files override overlapping values from ReactTracer's normal `colors` config.

Use runtime `colors` when the project should share the same defaults in code.

Use theme files when you want file-based overrides for one machine or one environment.

## Theme File Names

- `*react-theme.json`: base overrides for both light and dark mode
- `*react-theme-light.json`: light-mode overrides
- `*react-theme-dark.json`: dark-mode overrides

If the files are personal overrides, keep them out of git:

```gitignore
# Personal react tracer themes
*react-theme.json
*react-theme-light.json
*react-theme-dark.json
```

## When To Use What

- Use runtime `colors` when the whole project should share the same defaults.
- Use theme files when you want local overrides without editing app startup.
- Use `@autotracer/plugin-vite-react18` when you want those files loaded automatically.

## Reference

For theme categories, merge order, and copyable examples:

- Theme API: https://docs.autotracer.dev/themes/react18/api
- Theme examples: https://docs.autotracer.dev/themes/react18/examples
- React configuration: https://docs.autotracer.dev/guide/config-react
- Vite plugin API: https://docs.autotracer.dev/api/plugin-vite-react18
