# Installation - FlowTracer with Next.js

Install and configure FlowTracer in a Next.js application to trace function execution across your entire app.

## Prerequisites

- Node.js 18+
- Next.js 12+ (Pages Router or App Router)
- Modern browser with ES2020+ support

## Installation

```bash
# Install runtime and Babel plugin
pnpm add @autotracer/flow
pnpm add -D @autotracer/plugin-babel-flow @babel/core

# Using npm
npm install @autotracer/flow
npm install --save-dev @autotracer/plugin-babel-flow @babel/core

# Using yarn
yarn add @autotracer/flow
yarn add -D @autotracer/plugin-babel-flow @babel/core
```

`@autotracer/logger` installs automatically with `@autotracer/flow`. `@babel/core` is the required Babel peer dependency.

For browser-based internal web apps, the normal control surface is the Dashboard. On the Next.js and other Babel-based paths, you mount it manually when you want that workflow:

```bash
pnpm add -D @autotracer/dashboard
```

## Configuration

### 1. Configure Babel Plugin

Create or update `babel.config.js` in your project root:

Use [FlowTracer Babel settings](/reference/build/flow/babel/) for the exact option behavior.

```javascript
// babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@autotracer/plugin-babel-flow",
      {
        include: {
          paths: ["pages/**", "app/**", "lib/**", "utils/**"],
          functions: ["handle*", "on*", "fetch*", "process*"],
        },
        exclude: {
          functions: ["helper*", "internal*"],
        },
      },
    ],
  ],
};
```

### 2. Initialize Runtime (Pages Router)

Update `pages/_app.tsx`:

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

This setup imports `@autotracer/flow/runtime`, so the Flow runtime installs in dormant mode.

### 3. Initialize Runtime (App Router)

Create `app/layout.tsx`:

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

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <AutoTracerFlowBoundary>{children}</AutoTracerFlowBoundary>
        </Suspense>
      </body>
    </html>
  );
}
```

This App Router path does the same thing: it installs the Flow runtime in dormant mode before the rest of the traced client tree runs.

If you want the Dashboard workflow in Next.js, mount it inside that same async bootstrap path:

```typescript
const { mountDashboard } = await import("@autotracer/dashboard");
mountDashboard();
```

Use [Dashboard Package Reference](/dashboard/reference) for `mountDashboard(...)` behavior. For package-side widget settings, use [Dashboard `enabled`](/dashboard/config/enabled), [Dashboard `hideByDefault`](/dashboard/config/hideByDefault), [Dashboard `position`](/dashboard/config/position), and [Dashboard `hotkeys`](/dashboard/config/hotkeys).

Use the lower-level `globalThis.autoTracer.flowTracer` API in tests, automation, and other non-Dashboard setups.

### 3. Create Test Functions

Create `lib/calculator.ts`:

```typescript
// lib/calculator.ts
export function calculateTotal(items: { price: number }[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = calculateTax(subtotal);
  return subtotal + tax;
}

function calculateTax(amount: number) {
  return amount * 0.08;
}

export async function fetchPrice(productId: string) {
  const response = await fetch(`/api/products/${productId}`);
  return response.json();
}
```

### 4. Use in a Page

Create `pages/index.tsx` (Pages Router):

```typescript
// pages/index.tsx
import { useState } from 'react';
import { calculateTotal } from '../lib/calculator';

export default function Home() {
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const items = [{ price: 10 }, { price: 20 }, { price: 30 }];
    const total = calculateTotal(items);
    setResult(total);
  };

  return (
    <div>
      <h1>FlowTracer Demo</h1>
      <button onClick={handleCalculate}>Calculate Total</button>
      {result !== null && <p>Total: ${result.toFixed(2)}</p>}
    </div>
  );
}
```

Or `app/page.tsx` (App Router):

```typescript
// app/page.tsx
'use client';

import { useState } from 'react';
import { calculateTotal } from '../lib/calculator';

export default function Home() {
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const items = [{ price: 10 }, { price: 20 }, { price: 30 }];
    const total = calculateTotal(items);
    setResult(total);
  };

  return (
    <div>
      <h1>FlowTracer Demo</h1>
      <button onClick={handleCalculate}>Calculate Total</button>
      {result !== null && <p>Total: ${result.toFixed(2)}</p>}
    </div>
  );
}
```

## Running Your App

```bash
# Development mode
pnpm dev

# Or with npm
npm run dev
```

Open your browser to `http://localhost:3000`. If this setup mounts the Dashboard, start tracing there. Otherwise start tracing from the lower-level runtime API, then click the "Calculate Total" button.

```javascript
globalThis.autoTracer.flowTracer.start();
```

## What You'll See

When you click the button, the console shows:

```
→ calculateTotal
param items: [{price: 10}, {price: 20}, {price: 30}]
  → calculateTax
  param amount: 60
  returned: 4.8
  ← calculateTax (elapsed: 0.2ms)
returned: 64.8
← calculateTotal (elapsed: 1.5ms)
```

## Dormant Mode (Recommended for Restricted Test/QA Deployments)

The bootstrap examples above already use dormant mode.

If this setup mounts the Dashboard, use that as the normal control surface.

Otherwise tracing stays off until you activate it:

```typescript
globalThis.autoTracer.flowTracer.start();
```

Stop it again when you are done:

```javascript
globalThis.autoTracer.flowTracer.stop();
```

If you want immediate local output instead, import `@autotracer/flow` without `@autotracer/flow/runtime` in your bootstrap path.

## Tracing API Routes

For Next.js API routes (Pages Router):

```typescript
// pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  const product = await fetchProduct(id as string);
  res.status(200).json(product);
}

async function fetchProduct(id: string) {
  // This function will be traced
  const data = await fetch(`https://api.example.com/products/${id}`);
  return data.json();
}
```

For App Router API routes:

```typescript
// app/api/products/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const product = await fetchProduct(params.id);
  return Response.json(product);
}

async function fetchProduct(id: string) {
  // This function will be traced
  const data = await fetch(`https://api.example.com/products/${id}`);
  return data.json();
}
```

## Selective Function Tracing

### Event Handlers Only

```javascript
// babel.config.js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "include": {
          "paths": ["pages/**", "app/**"],
          "functions": ["handle*", "on*"]
        }
      }
    ]
  ]
}
```

### API and Utilities

```javascript
// babel.config.js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "include": {
          "paths": ["pages/api/**", "app/api/**", "lib/**", "utils/**"],
          "functions": ["*"]
        }
      }
    ]
  ]
}
```

### Business Logic Only

```javascript
// babel.config.js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "include": {
          "paths": ["lib/business/**", "services/**"],
          "functions": ["calculate*", "process*", "validate*"]
        }
      }
    ]
  ]
}
```

## Integration with ReactTracer

Combine FlowTracer with ReactTracer for complete visibility:

```bash
pnpm add @autotracer/react18
pnpm add -D @autotracer/plugin-babel-react18
```

```javascript
// babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@autotracer/plugin-babel-react18",
      {
        mode: "opt-out",
        serverComponents: true, // For App Router
        include: ["pages/**", "app/**", "components/**"],
      },
    ],
    [
      "@autotracer/plugin-babel-flow",
      {
        include: {
          paths: ["lib/**", "utils/**", "pages/api/**", "app/api/**"],
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

const AutoTracerBootstrap = lazy(async () => {
  if (isDevelopment || isInternalQa) {
    await import('@autotracer/flow/runtime');

    const { reactTracer, isReactTracerInitialized } = await import(
      '@autotracer/react18',
    );

    if (!isReactTracerInitialized()) {
      reactTracer({ enabled: false });
    }
  }

  return {
    default: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense fallback={null}>
      <AutoTracerBootstrap>
        <Component {...pageProps} />
      </AutoTracerBootstrap>
    </Suspense>
  );
}
```

## Advanced Configuration

### Environment-based Control

```javascript
// babel.config.js
const plugins = [];

if (process.env.ENABLE_FLOW_TRACING === "1") {
  plugins.push([
    "@autotracer/plugin-babel-flow",
    {
      include: {
        paths: ["lib/**", "utils/**"],
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

## Troubleshooting

### Functions Not Traced

**Check:**

1. File matches `include.paths` pattern
2. Function name matches `include.functions` pattern
3. File/function not in `exclude` patterns
4. Your intended runtime entry is imported: `@autotracer/flow` for immediate startup or `@autotracer/flow/runtime` for dormant startup
5. If this setup mounts the Dashboard, confirm tracing is started there
6. Otherwise confirm tracing is started through the lower-level runtime API: `globalThis.autoTracer.flowTracer.start()`

### Import Errors

**Issue:** `Cannot find module '@autotracer/flow/runtime'`

**Solution:** Ensure runtime is lazy-loaded in app bootstrap:

```typescript
await import("@autotracer/flow/runtime");
```

### Build Errors

**Common issues:**

- Missing `next/babel` preset - add it first in presets array
- Babel config syntax errors - validate JSON/JS syntax
- Plugin not installed - run `pnpm add -D @autotracer/plugin-babel-flow`

### Performance Issues

If tracing slows your app:

1. Use more specific function patterns:

```javascript
{
  "functions": ["handle*", "fetch*"]  // Instead of "*"
}
```

2. Enable dormant mode:

```typescript
void import("@autotracer/flow/runtime");
```

3. Exclude high-frequency functions:

```javascript
{
  "exclude": {
    "functions": ["render*", "update*", "_*"]
  }
}
```

## Best Practices

### Do:

- Use dormant mode for restricted internal test or QA deployments
- Combine with ReactTracer for full visibility
- Use dashboard if possible

### Don't:

- Enable tracing in publicly accessible builds

## Next Steps

- [Configuration Reference](/guide/config-flow) - All configuration options
- [FlowTracer Runtime Settings](/reference/runtime/flow/) - Runtime installation, dormant mode, and browser control
- [FlowTracer Theme API](/themes/flow/api) - Theme files and the runtime `theme` setting
- [Troubleshooting](/guide/troubleshooting) - Common issues and solutions
- [API Reference](/api/flow) - Full API documentation
- [Best Practices](/best-practices/performance) - Performance optimization

## See Also

- [ReactTracer Installation](/guide/installation-react-nextjs-pages) - Component tracing for Next.js
- [Vite Installation](/guide/installation-flow-vite) - Vite alternative
- [FlowTracer Babel settings](/reference/build/flow/babel/) - Exact Babel plugin option behavior
