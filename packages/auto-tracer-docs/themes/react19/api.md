# ReactTracer Theme API For React 19

`@autotracer/react19` owns the React theme object used to style trace output. `@autotracer/plugin-vite-react19` owns file discovery and HTML injection for theme files. The theme keys, merge rules, and file names match the current React 19 runtime and Vite plugin behavior.

## Resolution Order

React 19 resolves theme input in this order:

1. built-in defaults from `@autotracer/react19`
2. programmatic overrides through the runtime `colors` option
3. Vite-injected theme files from `globalThis.__REACTTRACER_THEME__`

That order lets a project define shared defaults in code while keeping local or environment-specific theme-file overrides on the Vite path.

## Theme File Ownership

Theme files are loaded only by `@autotracer/plugin-vite-react19` when `inject` is enabled. The Babel plugin and the low-level injector do not load theme files.

The Vite plugin searches the Vite project root in this order:

- `*react-theme.json`
- `*react-theme-light.json`
- `*react-theme-dark.json`

If multiple files match one step, the first alphabetical match wins for that step.

## Category Shape

Each top-level category accepts this partial shape:

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

Because the object is partial, you can override one category, one mode, or one property without redefining the full theme.

```json
{
  "stateChange": {
    "darkMode": {
      "text": "#ffcf33",
      "bold": true
    }
  }
}
```

## Theme Categories

| Key | Used for |
| --- | --- |
| `definitiveRender` | tracked components that actually rendered |
| `propInitial` | initial prop values on mount |
| `propChange` | prop changes |
| `stateInitial` | initial state values on mount |
| `stateChange` | state changes |
| `logStatements` | explicit component log output |
| `warnStatements` | warning output |
| `errorStatements` | error output |
| `reconciled` | components React checked without rendering |
| `skipped` | components React traversed without calling |
| `identicalStateValueWarning` | identical state-value warnings |
| `identicalPropValueWarning` | identical prop-value warnings |
| `other` | any other or unknown component output |

## Validation Notes

The React 19 runtime validates loaded theme files and warns when a file uses unknown categories, invalid keys, invalid CSS color strings, or `dark` and `light` instead of `darkMode` and `lightMode`.

## Usage

```ts
reactTracer({
  colors: {
    definitiveRender: {
      lightMode: { text: "#0055cc", bold: true },
      darkMode: { text: "#7dd3fc", bold: true },
      icon: "⚡"
    },
    errorStatements: {
      darkMode: { text: "#ff6b6b", background: "#2f1c1c", bold: true },
      icon: "❌"
    }
  }
});
```

For repository examples you can copy into a project, see [React 19 theme examples](./examples).
