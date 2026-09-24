# Build-Time vs Runtime Exports Pattern

## Overview

ReactTracer packages follow a strict separation between **build-time utilities** (code that runs during bundling/compilation) and **runtime code** (code that runs in the browser/application).

This architectural pattern prevents Node.js-only dependencies from being bundled into client-side code, which is critical for frameworks like Next.js, Vite, and other modern bundlers.

## Pattern

### Package Structure

Each package that provides build-time utilities must:

1. **Create separate export paths in `package.json`:**

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./build-utils": {
      "import": "./dist/build-utils.js",
      "types": "./dist/build-utils.d.ts"
    },
    "./package.json": "./package.json"
  }
}
```

2. **Create `src/build-utils.ts` file:**

```typescript
// Build-time utilities for use in Babel/Vite plugins
// These functions use Node.js APIs (fs, path) and should NOT be imported in browser/client code

export { functionThatUsesFs } from "./lib/functions/theme/functionThatUsesFs.js";
export { anotherBuildTimeFunction } from "./lib/functions/anotherBuildTimeFunction.js";
```

3. **Remove build-time exports from main `src/index.ts`:**

```typescript
// ❌ DON'T: Export build-time utilities from main index
export { loadThemeFiles } from "./lib/functions/theme/loadThemeFiles.js";

// ✅ DO: Only export runtime code from main index
export { reactTracer, useReactTracer } from "./lib/index.js";
```

### Build Configuration

#### For TypeScript-only packages (like `@autotracer/flow`)

The default `tsc` build will automatically compile both `src/index.ts` and `src/build-utils.ts`.

No additional configuration needed.

#### For packages using Vite (like `@autotracer/react18`)

1. **Vite builds the runtime code** (main export)
2. **TypeScript builds the build-utils** (separate compilation)

Update `package.json` scripts:

```json
{
  "scripts": {
    "build": "tsc --emitDeclarationOnly && vite build && tsc --project tsconfig.build-utils.json"
  }
}
```

Create `tsconfig.build-utils.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": false,
    "declarationMap": false,
    "emitDeclarationOnly": false
  },
  "include": ["src/build-utils.ts", "src/lib/functions/theme/**/*.ts"]
}
```

### Import Path Constraints

**CRITICAL:** Build-time utilities **cannot use TypeScript path aliases** (like `@logger/...`) because they won't resolve at runtime when imported by plugins.

**Solution:** Use relative imports in files that will be in `build-utils.ts` dependency tree.

```typescript
// ❌ BAD: Path alias won't resolve when plugin imports build-utils
import { internalLogger } from "@logger/internalLogger.js";

// ✅ GOOD: Relative import works everywhere
import { internalLogger } from "../../../logger/internalLogger.js";
```

## Usage

### In Build Plugins

Babel/Vite plugins import from `/build-utils`:

```typescript
import { loadThemeFiles } from "@autotracer/react18/build-utils";
import { validateTheme } from "@autotracer/flow/build-utils";
```

### In Applications

Applications import from the main export (never from `/build-utils`):

```typescript
import { reactTracer, useReactTracer } from "@autotracer/react18";
import { createFlowTracer } from "@autotracer/flow";
```

## Why This Matters

### Without Separation

```
Application Code
  ├─ @autotracer/react18 (main export)
  │   ├─ Runtime tracing code ✅
  │   └─ loadThemeFiles (uses Node.js fs) ❌
  │       └─ Webpack tries to bundle 'fs' module
  │           └─ Build fails or bloats bundle with polyfills
```

### With Separation

```
Application Code
  └─ @autotracer/react18 (main export)
      └─ Runtime tracing code only ✅

Build Plugin (Node.js environment)
  └─ @autotracer/react18/build-utils
      └─ loadThemeFiles (uses Node.js fs) ✅
```

## Current Implementations

- `@autotracer/react18`
  - Main export: Runtime tracing APIs
  - `/build-utils`: `loadThemeFiles`, `mergeThemes`, `validateTheme`

- `@autotracer/flow`
  - Main export: Runtime tracing APIs
  - `/build-utils`: `loadThemeFiles`, `validateTheme`

## Checklist for New Packages

When creating a new package that has build-time utilities:

- [ ] Create `src/build-utils.ts` with build-time exports
- [ ] Add `/build-utils` export path to `package.json`
- [ ] Remove build-time exports from `src/index.ts`
- [ ] Configure build to compile `build-utils.ts` (see Build Configuration above)
- [ ] Use relative imports (not path aliases) in build-time utility files
- [ ] Update plugins to import from `/build-utils`
- [ ] Verify Next.js/Vite builds succeed without Node.js polyfill warnings

## Related Documentation

- [Project Structure](./project-structure.instructions.md)
- [Package File Structure](../../.github/instructions/project-structure.instructions.md)
