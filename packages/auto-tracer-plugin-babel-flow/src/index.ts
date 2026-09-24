import type { PluginObj, PluginPass } from "@babel/core";
import * as t from "@babel/types";
import type { BabelPluginFlowConfig } from "./types/index.js";
import { normalizeConfig } from "./normalizeConfig.js";
import { shouldInstrumentFunction, getFunctionName, findParentFunctionName } from "./helpers.js";
import { shouldProcessFile } from "./shouldProcessFile.js";
import { instrumentFunctionBody } from "./transform.js";
import { getEffectiveFunctionPragmas } from "./getEffectiveFunctionPragmas.js";
import { passesRemainingPragmaSelection } from "./passesRemainingPragmaSelection.js";

// Export types for use in Vite plugin
export type { BabelPluginFlowConfig, NormalizedBabelPluginFlowConfig } from "./types/index.js";

// Shared Flow public API consumed by @autotracer/plugin-vite-flow
export { DEFAULT_CONFIG } from "./types/index.js";
export { normalizeConfig } from "./normalizeConfig.js";
export { shouldProcessFile } from "./shouldProcessFile.js";

/**
 * Babel plugin for automatic function flow tracing.
 * Injects try/catch/finally blocks for enter/exit tracking.
 *
 * @param _babel - Babel instance (unused, required by plugin API)
 * @param options - Plugin configuration
 * @returns Babel plugin object
 */
function flowTracerBabelPlugin(
  _babel: unknown,
  options: Partial<BabelPluginFlowConfig> = {}
): PluginObj<PluginPass> {
  const config = normalizeConfig(options);

  /**
   * Creates AST statements that apply a configured outputMode at module execution time.
   *
   * This is designed for Babel/Next.js integrations where there is no HTML injection hook.
   * The code is injected into modules that import `@autotracer/flow/runtime` so that
   * output formatting is configured before any instrumented user code typically runs.
   *
   * Side effects: writes to `globalThis.__autoTracerInternal` and may call
   * `globalThis.autoTracer.setOutputMode(...)` when the global API is already installed.
   *
   * @param outputMode - The output mode to apply
   * @returns Statements to prepend to the module body
   */
  function createStartupOutputModeStatements(
    outputMode: "devtools" | "copy-paste"
  ): t.Statement[] {
    const internalMemberExpression = t.memberExpression(
      t.identifier("globalThis"),
      t.identifier("__autoTracerInternal")
    );

    const ensureInternalState = t.ifStatement(
      t.binaryExpression(
        "===",
        internalMemberExpression,
        t.identifier("undefined")
      ),
      t.blockStatement([
        t.expressionStatement(
          t.assignmentExpression(
            "=",
            internalMemberExpression,
            t.objectExpression([
              t.objectProperty(
                t.identifier("outputMode"),
                t.stringLiteral(outputMode)
              ),
              t.objectProperty(
                t.identifier("subscribers"),
                t.arrayExpression([])
              ),
            ])
          )
        ),
      ])
    );

    const autoTracerMemberExpression = t.memberExpression(
      t.identifier("globalThis"),
      t.identifier("autoTracer")
    );

    const applyViaPublicApiWhenAvailable = t.ifStatement(
      t.binaryExpression(
        "!==",
        autoTracerMemberExpression,
        t.identifier("undefined")
      ),
      t.blockStatement([
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(
              autoTracerMemberExpression,
              t.identifier("setOutputMode")
            ),
            [t.stringLiteral(outputMode)]
          )
        ),
      ])
    );

    return [ensureInternalState, applyViaPublicApiWhenAvailable];
  }

  return {
    name: "@autotracer/plugin-babel-flow",
    visitor: {
      // Check filename before processing any functions
      Program(path, state) {
        const filename = state.filename || state.file?.opts?.filename || "";

        // Always skip instrumentation for:
        // 1. node_modules (external dependencies)
        // 2. Our own packages to avoid circular instrumentation:
        //    - packages/auto-tracer-flow/dist or packages/auto-tracer-flow/src
        //    - packages/auto-tracer-logger/dist or packages/auto-tracer-logger/src
        //    - packages/auto-tracer-plugin-*/dist or packages/auto-tracer-plugin-*/src
        // 3. Files that import from @autotracer/flow (initialization files)
        const hardcodedSkip =
          filename.includes("/node_modules/") ||
          filename.includes("\\node_modules\\") ||
          /[\/\\]packages[\/\\]auto-tracer-flow[\/\\](src|dist)[\/\\]/.test(filename) ||
          /[\/\\]packages[\/\\]auto-tracer-logger[\/\\](src|dist)[\/\\]/.test(filename) ||
          /[\/\\]packages[\/\\]auto-tracer-plugin-[^\/\\]+[\/\\](src|dist)[\/\\]/.test(filename);

        if (hardcodedSkip) {
          path.skip();
          return;
        }

        // Skip files that import from @autotracer/flow (initialization files)
        const hasFlowImport = path.node.body.some(
          (node) =>
            node.type === "ImportDeclaration" &&
            typeof node.source.value === "string" &&
            node.source.value.startsWith("@autotracer/flow")
        );

        if (hasFlowImport) {
          const outputMode = config.outputMode;
          const isOutputMode =
            outputMode === "devtools" || outputMode === "copy-paste";
          if (isOutputMode) {
            path.unshiftContainer(
              "body",
              createStartupOutputModeStatements(outputMode)
            );
          }

          path.skip();
          return;
        }

        // Apply user-configured file filtering
        if (!shouldProcessFile(filename, config.include, config.exclude)) {
          path.skip();
        }
      },

      // Function declarations: function foo() {}
      FunctionDeclaration(path) {
        const parentName = findParentFunctionName(path);
        const functionName = getFunctionName(path, parentName);
        if (!shouldInstrumentFunction(functionName, config.include, config.exclude)) return;
        const pragmas = getEffectiveFunctionPragmas(path, config);
        if (!passesRemainingPragmaSelection(pragmas, config)) return;
        const effectiveName = config.prefix ? `${config.prefix}:${functionName}` : functionName;
        instrumentFunctionBody(path, effectiveName, config);
      },

      // Function expressions: const foo = function() {}
      FunctionExpression(path) {
        const parentName = findParentFunctionName(path);
        const functionName = getFunctionName(path, parentName);
        if (!shouldInstrumentFunction(functionName, config.include, config.exclude)) return;
        const pragmas = getEffectiveFunctionPragmas(path, config);
        if (!passesRemainingPragmaSelection(pragmas, config)) return;
        const effectiveName = config.prefix ? `${config.prefix}:${functionName}` : functionName;
        instrumentFunctionBody(path, effectiveName, config);
      },

      // Arrow functions: const foo = () => {}
      ArrowFunctionExpression(path) {
        const parentName = findParentFunctionName(path);
        const functionName = getFunctionName(path, parentName);
        if (!shouldInstrumentFunction(functionName, config.include, config.exclude)) return;
        const pragmas = getEffectiveFunctionPragmas(path, config);
        if (!passesRemainingPragmaSelection(pragmas, config)) return;
        const effectiveName = config.prefix ? `${config.prefix}:${functionName}` : functionName;
        instrumentFunctionBody(path, effectiveName, config);
      },

      // Object methods: { foo() {} }
      ObjectMethod(path) {
        const parentName = findParentFunctionName(path);
        const functionName = getFunctionName(path, parentName);
        if (!shouldInstrumentFunction(functionName, config.include, config.exclude)) return;
        const pragmas = getEffectiveFunctionPragmas(path, config);
        if (!passesRemainingPragmaSelection(pragmas, config)) return;
        const effectiveName = config.prefix ? `${config.prefix}:${functionName}` : functionName;
        instrumentFunctionBody(path, effectiveName, config);
      },

      // Class methods: class Foo { bar() {} }
      ClassMethod(path) {
        const parentName = findParentFunctionName(path);
        const functionName = getFunctionName(path, parentName);
        if (!shouldInstrumentFunction(functionName, config.include, config.exclude)) return;
        const pragmas = getEffectiveFunctionPragmas(path, config);
        if (!passesRemainingPragmaSelection(pragmas, config)) return;
        const effectiveName = config.prefix ? `${config.prefix}:${functionName}` : functionName;
        instrumentFunctionBody(path, effectiveName, config);
      },

      // Call expressions: foo(), obj.method(), new Foo()
      // TODO: Implement filtering for CallExpression - currently disabled due to overwhelming output
      // CallExpression(path) {
      //   // Instrument all function calls to log parameters and return values
      //   instrumentCallExpressionPath(path, config.tracerName);
      // },
    },
  };
}

// Default export for Babel plugin compatibility
export default flowTracerBabelPlugin;
