# ReactTracer Example Themes

The repository ships ready-made ReactTracer theme files in the top-level `themes/` folder. These JSON files are useful as drop-in examples or as a starting point for your own theme.

## Included Files

| Repository file | Coverage | Matches |
| --- | --- | --- |
| `themes/dark-light-plus-react-theme.json` | light and dark mode in one file | `*react-theme.json` |
| `themes/dracula-react-theme-dark.json` | dark-mode override only | `*react-theme-dark.json` |
| `themes/one-dark-pro-react-theme-dark.json` | dark-mode override only | `*react-theme-dark.json` |

You can copy these files into the Vite root as-is. The loader accepts any prefix before `react-theme...`, so renaming them to shorter names like `react-theme.json` or `react-theme-dark.json` is optional.

If you use only a dark-mode file, ReactTracer keeps its built-in defaults for light mode unless another base or light file also matches.

## Dark Light Plus

Example excerpt from `themes/dark-light-plus-react-theme.json`:

```json
{
  "definitiveRender": {
    "icon": "🔄",
    "lightMode": { "text": "#0000ff", "bold": true },
    "darkMode": { "text": "#569cd6", "bold": true }
  },
  "errorStatements": {
    "icon": "❌",
    "lightMode": { "text": "#cd3131", "background": "#f8d7da", "bold": true },
    "darkMode": { "text": "#f44747", "background": "#3e2725", "bold": true }
  }
}
```

## Dracula Dark

Example excerpt from `themes/dracula-react-theme-dark.json`:

```json
{
  "definitiveRender": {
    "icon": "⚡",
    "darkMode": { "text": "#FF79C6" }
  },
  "stateChange": {
    "darkMode": { "text": "#BD93F9" }
  },
  "logStatements": {
    "darkMode": { "text": "#50FA7B" }
  }
}
```

## One Dark Pro

Example excerpt from `themes/one-dark-pro-react-theme-dark.json`:

```json
{
  "definitiveRender": {
    "icon": "⚡",
    "darkMode": { "text": "#61afef", "bold": true }
  },
  "warnStatements": {
    "darkMode": { "text": "#e5c07b" }
  },
  "errorStatements": {
    "darkMode": { "text": "#e06c75", "background": "#3e2c2e", "bold": true }
  }
}
```

For the full category reference and merge rules, see [ReactTracer Theme API](./api).
