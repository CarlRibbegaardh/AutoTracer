# ReactTracer Theme API

`@autotracer/react18` uses the `colors` option in `reactTracer()` to style render output. If you use `@autotracer/plugin-vite-react18`, the Vite plugin can also load theme files from the Vite root and inject them into `globalThis.__REACTTRACER_THEME__` before ReactTracer starts.

## Resolution Order

ReactTracer resolves theme input in this order:

1. built-in defaults from `defaultReactTracerOptions.colors`
2. programmatic config through the `colors` runtime option
3. Vite-injected theme files from `globalThis.__REACTTRACER_THEME__`
4. browser selection of `lightMode` or `darkMode` through your browser's [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme) preference

That means programmatic `colors` can set project defaults, while local theme files can override overlapping values for one developer or one environment.

## Theme File Names

Put theme files directly in the Vite root folder that the plugin builds from.

ReactTracer searches in this order:

- `*react-theme.json`
- `*react-theme-light.json`
- `*react-theme-dark.json`

If multiple files match one step, the first alphabetical match wins for that step.

## Category Shape

Each top-level category accepts the same structure:

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

Because the theme is partial, you can override one category, one mode, or one property without rewriting the full theme.

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

| Key | Used for | Default emphasis |
| --- | --- | --- |
| `definitiveRender` | tracked components that actually rendered | `⚡`, blue, bold |
| `propInitial` | initial prop values on mount | magenta, italic |
| `propChange` | prop changes | magenta |
| `stateInitial` | initial state values on mount | orange, italic |
| `stateChange` | state changes | orange |
| `logStatements` | explicit component log output | green |
| `warnStatements` | warning output | `⚠️`, warning background |
| `errorStatements` | error output | `❌`, error background |
| `reconciled` | components React checked without rendering | gray |
| `skipped` | components React traversed without calling | gray |
| `identicalStateValueWarning` | identical state-value warnings | `⚠️`, orange, bold |
| `identicalPropValueWarning` | identical prop-value warnings | `⚠️`, magenta, bold |
| `other` | any other or unknown component output | plain black or white text |

## Usage

```ts
async function initializeReactTracing(): Promise<void> {
  if (import.meta.env.DEV || import.meta.env.VITE_INTERNAL_QA === "true") {
    const { reactTracer } = await import("@autotracer/react18");

    reactTracer({
      colors: {
        definitiveRender: {
          lightMode: { text: "#0055cc", bold: true },
          darkMode: { text: "#7dd3fc", bold: true },
          icon: "⚡",
        },
        errorStatements: {
          darkMode: { text: "#ff6b6b", background: "#2f1c1c", bold: true },
          icon: "❌",
        },
      },
    });
  }
}

void initializeReactTracing();
```

For concrete files you can copy into a project, see [ReactTracer Example Themes](./examples).
