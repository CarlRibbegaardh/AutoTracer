# @autotracer/inject-react18

**Core AST transformation engine for automatic React component instrumentation.**

Low-level library providing the shared transformation logic used by the ReactTracer build plugins. It is for custom build tooling, not for normal app bootstrap or runtime control.

## Normal Integration

Use [@autotracer/plugin-vite-react18](./plugin-vite-react18) or [@autotracer/plugin-babel-react18](./plugin-babel-react18) for normal app integrations.

Use `@autotracer/inject-react18` directly only when you are authoring custom build tooling and you need direct control over the shared transform pipeline.

## Installation

```bash
pnpm add -D @autotracer/inject-react18
```

## Package API

This package exports four main groups of helpers:

- Transform entry points: `transform()`, `normalizeConfig()`, and `DEFAULT_CONFIG`
- Eligibility helpers: `matchesPattern()`, `shouldProcessFile()`, and `shouldInstrumentComponent()`
- Detection helpers: `isComponentFunction()`, `extractComponentInfo()`, and `hasExistingUseReactTracerImport()`
- Types: `TransformConfig`, `TransformContext`, `TransformResult`, and `ComponentInfo`

## Core Transform

### `transform(code, context)`

Transforms source code and returns the transformed output together with injection metadata.

```typescript
function transform(code: string, context: TransformContext): TransformResult;
```

Use `normalizeConfig()` before calling `transform()` so the `context.config` object is fully populated.

```typescript
import { normalizeConfig, transform } from "@autotracer/inject-react18";

const config = normalizeConfig({
  mode: "opt-out",
});

const result = transform(sourceCode, {
  filename: "Counter.tsx",
  config,
});
```

### `normalizeConfig(config?)`

Returns a fully populated config object by deep-merging the provided partial config with the shared defaults.

```typescript
function normalizeConfig(
  config?: Partial<TransformConfig>,
): Required<TransformConfig>;
```

`include` and `exclude` are deep-merged, so providing one nested field keeps the other defaulted fields in place.

### `DEFAULT_CONFIG`

Exports the shared default transform configuration.

Use the canonical inject settings pages for the exact behavior of each field:

- [`mode`](/reference/build/react18/inject/config/mode)
- [`include`](/reference/build/react18/inject/config/include)
- [`exclude`](/reference/build/react18/inject/config/exclude)
- [`serverComponents`](/reference/build/react18/inject/config/serverComponents)
- [`importSource`](/reference/build/react18/inject/config/importSource)
- [`labelHooks`](/reference/build/react18/inject/config/labelHooks)
- [`labelHooksPattern`](/reference/build/react18/inject/config/labelHooksPattern)

## Eligibility Helpers

### `matchesPattern(filepath, patterns)`

Matches a normalized file path against the package's simple glob-like pattern syntax.

```typescript
function matchesPattern(filepath: string, patterns: string[]): boolean;
```

### `shouldProcessFile(filepath, config)`

Applies the shared file-level include and exclude checks and returns whether a file should continue into the transform.

```typescript
function shouldProcessFile(
  filepath: string,
  config: Required<TransformConfig>,
): boolean;
```

### `shouldInstrumentComponent(componentName, pragmas, config)`

Applies component-level eligibility, pragma precedence, and mode fallback.

```typescript
function shouldInstrumentComponent(
  componentName: string,
  pragmas: { hasTrace: boolean; hasDisable: boolean },
  config: Required<TransformConfig>,
): boolean;
```

Component eligibility is absolute. A component that misses `include.components` or matches `exclude.components` is skipped even if `// @trace` is present.

## Detection Helpers

### `isComponentFunction(node, path, hookNameRegex?)`

Returns whether the given AST node should be treated as an instrumentable React component.

### `extractComponentInfo(node)`

Extracts the component metadata used by the transform result and downstream tooling.

### `hasExistingUseReactTracerImport(ast, importSource)`

Returns whether the program AST already imports `useReactTracer` from the configured `importSource`.

## Exported Types

### `TransformConfig`

The shared configuration shape for the low-level transform.

Use the canonical settings pages for field-by-field behavior:

- [`mode`](/reference/build/react18/inject/config/mode)
- [`include`](/reference/build/react18/inject/config/include)
- [`exclude`](/reference/build/react18/inject/config/exclude)
- [`serverComponents`](/reference/build/react18/inject/config/serverComponents)
- [`importSource`](/reference/build/react18/inject/config/importSource)
- [`labelHooks`](/reference/build/react18/inject/config/labelHooks)
- [`labelHooksPattern`](/reference/build/react18/inject/config/labelHooksPattern)

### `TransformContext`

The context object passed to `transform()`.

```typescript
interface TransformContext {
  filename: string;
  config: Required<TransformConfig>;
  prefix?: string;
}
```

- `filename`: source file path used by the file filter and diagnostics
- `config`: fully normalized transform config
- `prefix`: optional prefix prepended to injected component names as `prefix:ComponentName`

### `TransformResult`

The result object returned from `transform()`.

```typescript
interface TransformResult {
  code: string;
  map?: any;
  injected: boolean;
  components: ComponentInfo[];
}
```

- `code`: transformed or original source text
- `map`: optional generated source map payload
- `injected`: whether the transform injected tracing
- `components`: the component metadata collected while scanning the file

### `ComponentInfo`

Metadata describing one detected component.

```typescript
interface ComponentInfo {
  name: string;
  isAnonymous: boolean;
  node: any;
  start?: number;
  end?: number;
}
```

## Related Docs

- [ReactTracer Shared Transform](/reference/build/react18/inject/) for the low-level transform overview
- [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/) for the Vite-owned integration path
- [ReactTracer Babel Plugin Settings](/reference/build/react18/babel/) for the Babel-owned integration path
- [@autotracer/plugin-vite-react18](/api/plugin-vite-react18) for the Vite package entry
- [@autotracer/plugin-babel-react18](/api/plugin-babel-react18) for the Babel package entry
