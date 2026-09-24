# FlowTracer Example Themes

The repository ships ready-made FlowTracer theme files in the top-level `themes/` folder. These are concrete JSON examples for the normal Vite theme-file path.

If you are working on the separate manual tracer path, you can copy the same category values into `createFlowTracer(logger, { theme })`, but that is not the normal app integration path.

## Included Files

| Repository file | Coverage | Matches |
| --- | --- | --- |
| `themes/dark-light-plus-flow-theme.json` | light and dark mode in one file | `*flow-theme.json` |
| `themes/dracula-flow-theme-dark.json` | dark-mode override only | `*flow-theme-dark.json` |
| `themes/one-dark-pro-flow-theme-dark.json` | dark-mode override only | `*flow-theme-dark.json` |

You can copy these files into the Vite root as-is. The loader accepts any prefix before `flow-theme...`, so renaming them to shorter names like `flow-theme.json` or `flow-theme-dark.json` is optional.

If you use only a dark-mode file, FlowTracer keeps its default light-mode styling unless another base or light file also matches.

## Dark Light Plus

Example excerpt from `themes/dark-light-plus-flow-theme.json`:

```json
{
  "asyncStart": {
    "icon": "🚀",
    "lightMode": { "text": "#795e26", "bold": true, "italic": true },
    "darkMode": { "text": "#dcdcaa", "bold": true, "italic": true }
  },
  "exception": {
    "icon": "💥",
    "lightMode": { "text": "#cd3131", "background": "#f8d7da", "bold": true },
    "darkMode": { "text": "#f44747", "background": "#3e2725", "bold": true }
  }
}
```

## Dracula Dark

Example excerpt from `themes/dracula-flow-theme-dark.json`:

```json
{
  "functionEnter": {
    "icon": "→",
    "darkMode": { "text": "#50FA7B", "bold": true }
  },
  "parameter": {
    "darkMode": { "text": "#FFB86C", "italic": true }
  },
  "returnValue": {
    "darkMode": { "text": "#8BE9FD" }
  }
}
```

## One Dark Pro

Example excerpt from `themes/one-dark-pro-flow-theme-dark.json`:

```json
{
  "functionEnter": {
    "icon": "→",
    "darkMode": { "text": "#61afef", "bold": true }
  },
  "returnValue": {
    "icon": "",
    "darkMode": { "text": "#98c379" }
  },
  "exception": {
    "icon": "💥",
    "darkMode": { "text": "#e06c75", "background": "#3e2c2e", "bold": true }
  }
}
```

For the full category reference and setup rules, see [FlowTracer Theme API](./api).
