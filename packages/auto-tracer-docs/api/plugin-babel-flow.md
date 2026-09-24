# @autotracer/plugin-babel-flow

**Babel plugin for automatic function flow tracing (Next.js, CRA, Webpack).**

Build-time plugin that automatically instruments functions to track function start/end, parameters, return values, and exceptions. Works with any Babel-based build system including Next.js, Create React App, and custom Webpack/Rollup setups.

## Recommended Setup

Use `@autotracer/plugin-babel-flow` for build-time instrumentation and keep runtime startup in a separate app bootstrap module.

Set instrumentation selection in the Babel plugin config with `include`, `exclude`, `mode`, and pragma comments. Set `outputMode` in the Babel plugin config when your bootstrap imports `@autotracer/flow` or `@autotracer/flow/runtime`, because the plugin can inject that startup output-mode setting for you.

Lazy-load `@autotracer/flow` when you want tracing to start immediately. Lazy-load `@autotracer/flow/runtime` when you want dormant startup and later runtime control.

For browser-based runtime control, use the [Dashboard workflow](/dashboard/webapps). When the dashboard is not available, use the lower-level commands in [@autotracer/flow](./flow).

## Installation

```bash
# Install runtime and plugin
pnpm add @autotracer/flow
pnpm add -D @autotracer/plugin-babel-flow @babel/core

# Using npm
npm install @autotracer/flow
npm install --save-dev @autotracer/plugin-babel-flow @babel/core

# Using yarn
yarn add @autotracer/flow
yarn add -D @autotracer/plugin-babel-flow @babel/core
```

**Note:** `@autotracer/logger` installs automatically with `@autotracer/flow`. `@babel/core` is a peer dependency required by the Babel plugin.

**For pnpm users:** Add to `.npmrc`:

```ini
# .npmrc
auto-install-peers=true
```

## Public Surface

`@autotracer/plugin-babel-flow` exposes these public build-time surfaces:

- default Babel plugin export used as `"@autotracer/plugin-babel-flow"` in Babel config
- `BabelPluginFlowConfig`
- `DEFAULT_CONFIG`, `normalizeConfig`, and `shouldProcessFile` for shared tooling
- `outputMode`
- `logExceptions`
- `exceptionLogLevel`
- `tracerName`
- `include`
- `exclude`
- `mode`
- `prefix`
- Flow pragma comments

Runtime loading and browser control live in [@autotracer/flow](./flow).

Use [FlowTracer Babel Plugin Settings](/reference/build/flow/babel/) for the canonical per-setting reference.

## Quick Start

### Next.js

```javascript
// babel.config.js or .babelrc
module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@autotracer/plugin-babel-flow",
      {
        include: {
          paths: ["**/src/**", "**/app/**"],
          functions: ["handle*", "on*", "fetch*"],
        },
      },
    ],
  ],
};
```

```typescript
// app/AutoTracerFlowBootstrap.tsx or components/AutoTracerFlowBootstrap.tsx
"use client"; // App Router only

import { Suspense, lazy, type ReactNode } from 'react';

const isDevelopment = process.env.NODE_ENV === 'development';
const isInternalQa = process.env.NEXT_PUBLIC_INTERNAL_QA === 'true';

const AutoTracerFlowBoundary = lazy(async () => {
  if (isDevelopment || isInternalQa) {
    await import('@autotracer/flow/runtime');
  }

  return {
    default: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

export function AutoTracerFlowBootstrap({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AutoTracerFlowBoundary>{children}</AutoTracerFlowBoundary>
    </Suspense>
  );
}
```

### Create React App

```javascript
// .babelrc or babel.config.js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "include": {
          "paths": ["src/**"],
          "functions": ["*"]
        }
      }
    ]
  ]
}
```

```typescript
// src/index.tsx
const isDevelopment = process.env.NODE_ENV === 'development';
const isInternalQa = process.env.REACT_APP_INTERNAL_QA === 'true';

async function bootstrap(): Promise<void> {
  if (isDevelopment || isInternalQa) {
    await import('@autotracer/flow/runtime');
  }

  const ReactDOM = await import('react-dom/client');
  const { default: App } = await import('./App');

  ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
}

void bootstrap();
```

## API Reference

### Babel Plugin Options

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        // Options here
      }
    ]
  ]
}
```

### `BabelPluginFlowConfig`

Configuration interface for the Babel plugin.

For exact setting behavior, use [FlowTracer Babel Plugin Settings](/reference/build/flow/babel/).

```typescript
interface BabelPluginFlowConfig {
  /**
   * Sets the trace output format at startup.
  * When a processed module imports `@autotracer/flow` or `@autotracer/flow/runtime`,
  * the plugin injects startup code
    * so you do not need to call `globalThis.autoTracer.setOutputMode(...)` manually.
   * @default undefined
   */
  outputMode?: "devtools" | "copy-paste";

  /**
   * Include exception logging in catch blocks
   * @default true
   */
  logExceptions?: boolean;

  /**
   * Log level for exception logging
   * @default 'debug'
   */
  exceptionLogLevel?: "debug" | "warn" | "error";

  /**
    * Local tracer binding name used in injected code
   * @default '__flowTracer'
   */
  tracerName?: string;

  /**
   * Include configuration
   */
  include?: {
    /**
     * File path patterns (glob patterns)
     */
    paths?: string[];

    /**
     * Function name patterns (glob, regex, or exact strings)
     */
    functions?: Array<string | RegExp>;
  };

  /**
   * Exclude configuration
   */
  exclude?: {
    /**
     * File path patterns (glob patterns)
     */
    paths?: string[];

    /**
     * Function name patterns (glob, regex, or exact strings)
     */
    functions?: Array<string | RegExp>;
  };

  /**
   * Prefix prepended to every logged function name.
   *
   * Useful in islands or micro-frontend architectures where multiple independent
   * bundles share the same DevTools console, making it clear which app a log belongs to.
   *
   * Example: `prefix: "Island1"` logs `"Island1:processData"` instead of `"processData"`.
   *
   * **Filtering is not affected** — `include`/`exclude` patterns always match against
   * the original, un-prefixed function name.
   *
   * **Runtime start/stop is not affected** — the prefix is a build-time label baked
   * into the injected call; it has no runtime routing or gating effect.
   */
  prefix?: string;

  /**
   * Instrumentation mode.
   * - 'opt-in': Only instrument when `@trace` pragma is present on an eligible function
   * - 'opt-out': Instrument all eligible functions unless `@trace-disable` is present
   * @default 'opt-out'
   */
  mode?: 'opt-in' | 'opt-out';
}
```

## Pragmas

Use line comments to control function-level instrumentation.

- `// @trace` enables one eligible function.
- `// @trace-disable` disables one eligible function.
- `include` and `exclude` decide the eligible set before pragma signals are applied.

For exact placement rules, precedence, nested-function behavior, and examples, see [Flow pragma comments](/reference/build/flow/babel/pragmas).

## Configuration

### `outputMode`

Choose the trace output format FlowTracer starts with.

When a processed module imports `@autotracer/flow` or `@autotracer/flow/runtime`, the Babel plugin injects startup code that applies this format before instrumented user code usually runs.

If you omit `outputMode`, the Babel plugin does not inject startup output-mode code.

For exact behavior, use [`outputMode`](/reference/build/flow/babel/config/outputMode).

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "outputMode": "copy-paste"
      }
    ]
  ]
}
```

### `logExceptions`

Include exception logging in catch blocks.

For exact behavior, use [`logExceptions`](/reference/build/flow/babel/config/logExceptions) and [`exceptionLogLevel`](/reference/build/flow/babel/config/exceptionLogLevel).

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "logExceptions": true
      }
    ]
  ]
}
```

### `include` / `exclude`

Selective function instrumentation.

By default, the plugin includes `"**/*.{js,jsx,mjs,ts,tsx,mts}"`, excludes common noise paths such as tests, build outputs, coverage folders, and dependency folders, and applies no function-name filters.

Partial `include` and `exclude` objects use object-key merge. Each key you provide replaces the default for that key only. Arrays are never concatenated.

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "include": {
          "paths": ["**/src/**", "**/app/**"],
          "functions": ["calculate*", "process*", "handle*", "fetch*"]
        },
        "exclude": {
          "functions": ["helper*", "internal*", "_*"]
        }
      }
    ]
  ]
}
```

This keeps the default path exclusions while adding function-name exclusions.

For exact behavior, use [`include`](/reference/build/flow/babel/config/include), [`exclude`](/reference/build/flow/babel/config/exclude), [`mode`](/reference/build/flow/babel/config/mode), [`prefix`](/reference/build/flow/babel/config/prefix), and [Flow pragma comments](/reference/build/flow/babel/pragmas).

**Pattern Examples:**

- `'*'` - All
- `'handle*'` - Starts with "handle"
- `'*Handler'` - Ends with "Handler"
- `'*process*'` - Contains "process"
- `['on*', 'handle*']` - Multiple patterns

## Features

### Automatic Function Instrumentation

Wraps functions with tracing code during compilation:

```javascript
// Original
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Instrumented (simplified emitted shape)
function calculateTotal(items) {
  const __flowTracer = globalThis.__flowTracer;
  const _h = __flowTracer.enter("calculateTotal");
  __flowTracer.traceParameter("items", items);
  try {
    const _returnValue = items.reduce((sum, item) => sum + item.price, 0);
    __flowTracer.traceReturnValue(_returnValue);
    return _returnValue;
  } catch (e) {
    __flowTracer.traceException("calculateTotal", e, "debug");
    throw e;
  } finally {
    __flowTracer.exit(_h);
  }
}
```

### Try/Catch/Finally Injection

Safely tracks exceptions without breaking error handling:

```javascript
// Original with try/catch
function riskyOperation() {
  try {
    return dangerousCall();
  } catch (error) {
    console.error("Failed:", error);
    throw error;
  }
}

// Instrumented (simplified emitted shape)
function riskyOperation() {
  const __flowTracer = globalThis.__flowTracer;
  const _h = __flowTracer.enter("riskyOperation");
  try {
    try {
      const _returnValue = dangerousCall();
      __flowTracer.traceReturnValue(_returnValue);
      return _returnValue;
    } catch (error) {
      console.error("Failed:", error);
      throw error;
    }
  } catch (e) {
    __flowTracer.traceException("riskyOperation", e, "debug");
    throw e;
  } finally {
    __flowTracer.exit(_h);
  }
}
```

### Async Function Support

Handles promises and async/await automatically:

```javascript
// Original
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Example output format:
// → fetchUser (async started)
// param id: "123"
// returned: Promise
// ← fetchUser (async completed, elapsed: 12.3ms)
```

### Return Value Tracing

Captures all return statements:

```javascript
function divide(a, b) {
  if (b === 0) return null;
  return a / b;
}

// Both return values traced
```

### Dormant Mode Integration

Works with a bootstrap that lazy-loads `@autotracer/flow/runtime`:

```javascript
// In your app
const isDevelopment = process.env.NODE_ENV === "development";

async function bootstrap() {
  if (isDevelopment) {
    await import("@autotracer/flow/runtime"); // Starts dormant
  }

  await import("./app");
}

void bootstrap();
```

In browser-based internal web apps, use the Dashboard when that workflow is mounted. For lower-level start, stop, and status commands, see [@autotracer/flow](./flow).

## Integration

### Next.js Pages Router

```javascript
// babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@autotracer/plugin-babel-flow",
      {
        include: {
          paths: ["pages/**", "src/**"],
          functions: ["*"],
        },
      },
    ],
  ],
};
```

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { Suspense, lazy, type ReactNode } from 'react';

const isDevelopment = process.env.NODE_ENV === 'development';
const isInternalQa = process.env.NEXT_PUBLIC_INTERNAL_QA === 'true';

const AutoTracerFlowBootstrap = lazy(async () => {
  if (isDevelopment || isInternalQa) {
    await import('@autotracer/flow/runtime');
  }

  return {
    default: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense fallback={null}>
      <AutoTracerFlowBootstrap>
        <Component {...pageProps} />
      </AutoTracerFlowBootstrap>
    </Suspense>
  );
}
```

### Next.js App Router

```javascript
// babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@autotracer/plugin-babel-flow",
      {
        include: {
          paths: ["app/**", "src/**"],
          functions: ["*"],
        },
      },
    ],
  ],
};
```

```typescript
// app/layout.tsx
'use client';

import { Suspense, lazy, type ReactNode } from 'react';

const isDevelopment = process.env.NODE_ENV === 'development';
const isInternalQa = process.env.NEXT_PUBLIC_INTERNAL_QA === 'true';

const AutoTracerFlowBoundary = lazy(async () => {
  if (isDevelopment || isInternalQa) {
    await import('@autotracer/flow/runtime');
  }

  return {
    default: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Suspense fallback={null}>
          <AutoTracerFlowBoundary>{children}</AutoTracerFlowBoundary>
        </Suspense>
      </body>
    </html>
  );
}
```

### Create React App

```javascript
// .babelrc
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "include": {
          "paths": ["src/**"],
          "functions": ["*"]
        }
      }
    ]
  ]
}
```

```typescript
// src/index.tsx
const isDevelopment = process.env.NODE_ENV === "development";
const isInternalQa = process.env.REACT_APP_INTERNAL_QA === "true";

async function bootstrap(): Promise<void> {
  if (isDevelopment || isInternalQa) {
    await import("@autotracer/flow/runtime");
  }

  await import("./app");
}

void bootstrap();
```

### Custom Webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [
              [
                "@autotracer/plugin-babel-flow",
                {
                  include: {
                    paths: ["src/**"],
                    functions: ["*"],
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
};
```

### Custom Rollup

```javascript
// rollup.config.js
import babel from "@rollup/plugin-babel";

export default {
  plugins: [
    babel({
      plugins: [
        [
          "@autotracer/plugin-babel-flow",
          {
            include: {
              paths: ["src/**"],
              functions: ["*"],
            },
          },
        ],
      ],
    }),
  ],
};
```

## Requirements

- Babel 7+
- Node.js 18+
- Modern browser with ES2020+ support
- @babel/core (peer dependency)

## Performance

- **Build-time only** - All transformation during compilation
- **No plugin runtime logic** - The plugin runs only during compilation
- **Selective targeting** - Only instruments matched functions

When tracing is enabled, runtime overhead comes from the injected tracing hooks and the volume of console output/DevTools rendering.

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { BabelPluginFlowConfig } from "@autotracer/plugin-babel-flow";
```

## Examples

### Basic Next.js

```javascript
// babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@autotracer/plugin-babel-flow",
      {
        include: {
          paths: ["app/**", "pages/**", "src/**"],
          functions: ["*"],
        },
      },
    ],
  ],
};
```

### Event Handlers Only

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "include": {
          "paths": ["src/**"],
          "functions": ["handle*", "on*"]
        }
      }
    ]
  ]
}
```

### API Services

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "include": {
          "paths": ["src/api/**", "src/services/**"],
          "functions": ["fetch*", "get*", "post*"]
        }
      }
    ]
  ]
}
```

### Development Only

```javascript
// babel.config.js
const plugins = [];

if (process.env.NODE_ENV === "development") {
  plugins.push([
    "@autotracer/plugin-babel-flow",
    {
      include: {
        paths: ["src/**"],
        functions: ["*"],
      },
    },
  ]);
}

module.exports = {
  presets: ["next/babel"],
  plugins,
};
```

### Exclude Tests and Helpers

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "include": {
          "paths": ["src/**"],
          "functions": ["*"]
        },
        "exclude": {
          "paths": ["**/*.test.*", "**/*.spec.*"],
          "functions": ["helper*", "internal*", "_*"]
        }
      }
    ]
  ]
}
```

## Troubleshooting

### Not Instrumenting

Check:

1. File matches `include.paths` pattern (if configured)
2. Function name matches `include.functions` pattern (if configured)
3. File/function not in `exclude` patterns
4. Babel configuration loaded correctly

### Babel Configuration Not Loading

Ensure `.babelrc` or `babel.config.js` is in project root and properly formatted.

### Import Errors

Ensure your app bootstrap lazy-loads `@autotracer/flow` when you want immediate startup, or lazy-loads `@autotracer/flow/runtime` when you want dormant startup and later runtime control:

```typescript
await import("@autotracer/flow/runtime");
```

### Next.js Specific

For Next.js, use `babel.config.js` (not `.babelrc`) and include `next/babel` preset.

## Related Packages

- [@autotracer/flow](./flow) - Runtime library (required)
- [@autotracer/logger](./logger) - Internal shared logger utility used by `@autotracer/flow`
- [@autotracer/plugin-vite-flow](./plugin-vite-flow) - Vite plugin alternative
- [@autotracer/react18](./react18) - React component tracer (complementary)

## See Also

- [Quick Start Guide](/guide/quickstart-flow)
- [Configuration Reference](/guide/config-flow)
- [Troubleshooting](/guide/troubleshooting)
