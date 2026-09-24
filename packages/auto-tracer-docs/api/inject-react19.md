# @autotracer/inject-react19

Low-level React 19 AST transformation for AutoTracer build tooling. This package owns the shared transform used by the React 19 Vite and Babel plugins, and it is intended for tool authors rather than normal application bootstrap.

## Normal Integration

Use [@autotracer/plugin-vite-react19](/api/plugin-vite-react19) or [@autotracer/plugin-babel-react19](/api/plugin-babel-react19) for normal app integrations.

Use `@autotracer/inject-react19` directly only when you need direct control over the shared transform pipeline in custom tooling.

## Package API

This package exports four main groups of helpers:

- transform entry points: `transform()`, `normalizeConfig()`, and `DEFAULT_CONFIG`
- eligibility helpers: `matchesPattern()`, `shouldProcessFile()`, and `shouldInstrumentComponent()`
- detection helpers: `isComponentFunction()`, `extractComponentInfo()`, and `hasExistingUseReactTracerImport()`
- types: `TransformConfig`, `TransformContext`, `TransformResult`, and `ComponentInfo`

## Core Transform

### `transform(code, context)`

Transforms source code and returns the transformed output together with injection metadata.

```ts
function transform(code: string, context: TransformContext): TransformResult;
```

Use `normalizeConfig()` before calling `transform()` so `context.config` is fully populated.

```ts
import { normalizeConfig, transform } from "@autotracer/inject-react19";

const config = normalizeConfig({
  mode: "opt-out",
});

const result = transform(sourceCode, {
  filename: "Counter.tsx",
  config,
  prefix: "ShellA",
});
```

### `normalizeConfig(config?)`

Returns a fully populated config object by deep-merging the provided partial config with the shared defaults.

```ts
function normalizeConfig(
  config?: Partial<TransformConfig>,
): Required<TransformConfig>;
```

`include` and `exclude` are deep-merged, so providing one nested field keeps the other defaulted fields in place.

### `DEFAULT_CONFIG`

Exports the shared default transform configuration. Use the per-setting reference for exact field behavior:

- [`mode`](/reference/build/react19/inject/config/mode)
- [`include`](/reference/build/react19/inject/config/include)
- [`exclude`](/reference/build/react19/inject/config/exclude)
- [`serverComponents`](/reference/build/react19/inject/config/serverComponents)
- [`importSource`](/reference/build/react19/inject/config/importSource)
- [`labelHooks`](/reference/build/react19/inject/config/labelHooks)
- [`labelHooksPattern`](/reference/build/react19/inject/config/labelHooksPattern)

## Eligibility Helpers

### `matchesPattern(filepath, patterns)`

Matches a normalized file path against the package's glob-like pattern syntax.

```ts
function matchesPattern(filepath: string, patterns: string[]): boolean;
```

### `shouldProcessFile(filepath, config)`

Applies the shared file-level include and exclude checks and returns whether a file should continue into the transform.

```ts
function shouldProcessFile(
  filepath: string,
  config: Required<TransformConfig>,
): boolean;
```

### `shouldInstrumentComponent(componentName, pragmas, config)`

Applies component-level eligibility, pragma precedence, and mode fallback.

```ts
function shouldInstrumentComponent(
  componentName: string,
  pragmas: { hasTrace: boolean; hasDisable: boolean },
  config: Required<TransformConfig>,
): boolean;
```

Component eligibility is absolute. `// @trace` does not rescue a component that misses `include.components` or matches `exclude.components`.

## Detection Helpers

### `isComponentFunction(node, path, hookNameRegex?)`

Returns whether the given AST node should be treated as an instrumentable React component.

### `extractComponentInfo(node)`

Extracts the component metadata collected during the scan.

### `hasExistingUseReactTracerImport(ast, importSource)`

Returns whether the program already imports `useReactTracer` from the configured `importSource`.

## Exported Types

### `TransformContext`

The context object passed to `transform()`.

```ts
interface TransformContext {
  filename: string;
  config: Required<TransformConfig>;
  prefix?: string;
}
```

Use `prefix` when multiple islands, micro-frontends, or other independent React entry points share one browser tab and you need injected component names to stay distinguishable as `prefix:ComponentName`.

### `TransformResult`

The result object returned from `transform()`.

```ts
interface TransformResult {
  code: string;
  map?: unknown;
  injected: boolean;
  components: ComponentInfo[];
}
```

## Related Docs

- [React 19 shared transform settings](/reference/build/react19/inject/)
- [@autotracer/plugin-vite-react19](/api/plugin-vite-react19)
- [@autotracer/plugin-babel-react19](/api/plugin-babel-react19)
