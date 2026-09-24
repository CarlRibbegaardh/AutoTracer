# Islands Architecture

Using AutoTracer with Islands Architecture for optimal component isolation and debugging.

## Overview

Opt-in tracing with `// @trace` lets you target specific islands during a debugging session without trace noise from every other hydrated island on the page. Each island's mount cycle, state changes, and unmount are visible independently.

## AutoTracer Benefits for Islands

### 1. Per-Island Tracing

Trace specific islands without affecting others:

```typescript
// Island: CounterIsland.tsx
// @trace
export function CounterIsland() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Island: SearchIsland.tsx
// @trace-disable (not debugging this one)
export function SearchIsland() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### 2. Island Lifecycle Visibility

See when each island hydrates:

```
Component mount: CounterIsland
  State: count = 0

Component mount: CartIsland
  State: items = []
  State: total = 0

Component mount: NewsletterIsland
  State: email = ""
  State: subscribed = false
```

### 3. Isolated Debugging

Debug one island without trace noise from others.

## Example: E-commerce Product Page

```typescript
// app/products/[id]/page.tsx (Static)
export default function ProductPage({ params }) {
  return (
    <div>
      <h1>Product Details</h1>
      <ProductImages /> {/* Static */}
      <ProductDescription /> {/* Static */}

      {/* Interactive Islands */}
      <AddToCartIsland productId={params.id} />
      <ProductReviewsIsland productId={params.id} />
      <RelatedProductsIsland productId={params.id} />
    </div>
  );
}

// islands/AddToCartIsland.tsx
'use client';

import { useState } from 'react';

export function AddToCartIsland({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  // ...
}

// islands/ProductReviewsIsland.tsx
'use client';

import { useState, useEffect } from 'react';

export function ProductReviewsIsland({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  // ...
}
```

**Console Output:**

```
Component render cycle 1:
├─ [AddToCartIsland] Mount ⚡
│   Initial prop productId: "prod-123"
│   Initial state quantity: 1
│   Initial state adding: false

Component render cycle 2:
├─ [ProductReviewsIsland] Mount ⚡
│   Initial prop productId: "prod-123"
│   Initial state reviews: []
│   Initial state loading: true

Component render cycle 3:
├─ [ProductReviewsIsland] Rendering ⚡
│   State change reviews: [] → [{"id":1,"author":"John",...},...]
│   State change loading: true → false
```

## Configuration for Islands

### Opt-In Mode (Recommended)

Trace only the islands you're debugging:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    reactTracer.vite({
      mode: "opt-in", // Only trace marked islands
      include: {
        paths: ["islands/**/*.tsx"],
      },
    }),
    react(),
  ],
});
```

```typescript
// Trace this island
// @trace
export function BuggyIsland() {
  // ...
}

// Don't trace this one
export function WorkingIsland() {
  // ...
}
```

> **Note:** `include`/`exclude` component filters are evaluated before pragma signals. `@trace` only operates within the eligible set.

### Per-Island Control

Different settings for different islands:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    reactTracer.vite({
      mode: "opt-out",
      include: {
        paths: ["islands/**/*.tsx"],
      },
      exclude: {
        paths: [
          "islands/static/**", // Exclude static-only islands
          "islands/third-party/**", // Exclude third-party islands
        ],
      },
    }),
    react(),
  ],
});
```

### Prefix

When tracing multiple islands simultaneously, use `prefix` to label each island bundle's component names in the trace output. The injected name becomes `prefix:ComponentName`.

```typescript
// vite.config.ts for the cart island bundle
reactTracer.vite({
  prefix: "Cart",
  include: { paths: ["islands/cart/**/*.tsx"] },
});

// vite.config.ts for the reviews island bundle
reactTracer.vite({
  prefix: "Reviews",
  include: { paths: ["islands/reviews/**/*.tsx"] },
});
```

```
Component render cycle 1:
├─ [Cart:AddToCartIsland] Mount ⚡
│   Initial prop productId: "prod-123"
│   Initial state quantity: 1

Component render cycle 2:
├─ [Reviews:ProductReviewsIsland] Mount ⚡
│   Initial prop productId: "prod-123"
│   Initial state reviews: []
```

`include`/`exclude` path filters match against the original un-prefixed component name — prefix does not affect filtering.

## Debugging Islands

### Common Island Issues

#### 1. Island Not Hydrating

**Symptom:** Island doesn't become interactive

**Debug:**

```typescript
// @trace
export function ProblemIsland() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('Island hydrating...');
    setMounted(true);
  }, []);

  return <div>{mounted ? 'Hydrated!' : 'Mounting...'}</div>;
}
```

If no trace appears, island isn't hydrating—check build configuration.

#### 2. Island State Lost on Navigation

**Symptom:** State resets when navigating

**Debug with traces:**

```
Component unmount: CartIsland
  State: items = [{...}]  // Lost!

Component mount: CartIsland
  State: items = []  // Reset
```

**Solution:** Use global state or localStorage.

#### 3. Prop Mismatch After Hydration

**Symptom:** Props different after hydration

**Debug:**

```typescript
// @trace
export function DataIsland({ initialData }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    // Fetch fresh data after hydration
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
```

Traces show prop vs state differences.

## Next Steps

- [Microfrontends](/examples/microfrontends) - Multi-app integration
- [Custom Filtering](/examples/custom-filtering) - Advanced filtering
- [Advanced Patterns](/examples/advanced-patterns) - Complex scenarios
- [Performance Optimization](/best-practices/performance) - Optimization tips
