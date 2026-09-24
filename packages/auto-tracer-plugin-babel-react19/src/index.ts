import type {
  PluginObj,
  PluginPass,
  ParserOptions,
  ParseResult,
} from "@babel/core";
import * as babel from "@babel/core";
import * as babelParser from "@babel/parser";
import * as t from "@babel/types";
import {
  transform,
  normalizeConfig,
  shouldProcessFile,
  type TransformConfig,
} from "@autotracer/inject-react19";

export interface ReactTracerOptions extends Partial<TransformConfig> {
  /**
   * Sets the canonical AutoTracer output mode at module execution time.
   *
   * Injects initialization code into instrumented modules to configure
   * the output format before React tracing begins.
   *
   * @default undefined (not set - uses runtime default)
   *
   * @example
   * outputMode: 'devtools' // Interactive console groups
   *
   * @example
   * outputMode: 'copy-paste' // Text-based output for sharing
   */
  outputMode?: "devtools" | "copy-paste";
  /**
   * Optional prefix prepended to every injected component name in logs.
   *
   * Use this when multiple React entry-points (micro-frontends, islands)
   * share a browser tab and you need to distinguish their components.
   *
   * @example
  * prefix: 'Header' // → "Header:MyComponent" in logs
   */
  prefix?: string;
}

interface BabelPluginWithParserOverride extends PluginObj<PluginPass> {
  parserOverride?: (
    code: string,
    parserOpts: ParserOptions,
    parse: (code: string, parserOpts: ParserOptions) => ParseResult | null,
  ) => ParseResult | null;
}

// Must be default export for CJS compatibility for babel
function reactTracerBabelPlugin(
  _babel: typeof babel,
  options: ReactTracerOptions = {},
): BabelPluginWithParserOverride {
  const config = normalizeConfig(options);
  const outputMode = options.outputMode;
  const isOutputMode = outputMode === "devtools" || outputMode === "copy-paste";

  /**
   * Creates AST statements that seed a configured outputMode once per page load.
   *
   * Side effects: may write to `globalThis.__autoTracerInternal` and may call
   * `globalThis.autoTracer.setOutputMode(...)`.
   *
   * @param mode - Output mode to seed
   * @returns Statements to insert into the module body
   */
  function createSeedOnlyStartupOutputModeStatements(
    mode: "devtools" | "copy-paste",
  ): t.Statement[] {
    const internalMemberExpression = t.memberExpression(
      t.identifier("globalThis"),
      t.identifier("__autoTracerInternal"),
    );

    const ensureInternalState = t.ifStatement(
      t.binaryExpression(
        "===",
        internalMemberExpression,
        t.identifier("undefined"),
      ),
      t.blockStatement([
        t.expressionStatement(
          t.assignmentExpression(
            "=",
            internalMemberExpression,
            t.objectExpression([
              t.objectProperty(
                t.identifier("outputMode"),
                t.stringLiteral(mode),
              ),
              t.objectProperty(
                t.identifier("subscribers"),
                t.arrayExpression([]),
              ),
            ]),
          ),
        ),
        t.ifStatement(
          t.logicalExpression(
            "&&",
            t.binaryExpression(
              "!==",
              t.memberExpression(
                t.identifier("globalThis"),
                t.identifier("autoTracer"),
              ),
              t.identifier("undefined"),
            ),
            t.binaryExpression(
              "===",
              t.unaryExpression(
                "typeof",
                t.memberExpression(
                  t.memberExpression(
                    t.identifier("globalThis"),
                    t.identifier("autoTracer"),
                  ),
                  t.identifier("setOutputMode"),
                ),
              ),
              t.stringLiteral("function"),
            ),
          ),
          t.blockStatement([
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(
                  t.memberExpression(
                    t.identifier("globalThis"),
                    t.identifier("autoTracer"),
                  ),
                  t.identifier("setOutputMode"),
                ),
                [t.stringLiteral(mode)],
              ),
            ),
          ]),
        ),
      ]),
    );

    return [ensureInternalState];
  }

  /**
   * Inserts statements into a module body after any directive prologue.
   *
   * @param body - Module body statements
   * @param statements - Statements to insert
   */
  function insertAfterDirectivePrologue(
    body: Array<t.Statement | t.ModuleDeclaration>,
    statements: t.Statement[],
  ): void {
    /**
     * Checks if a statement is the first non-directive prologue statement.
     *
     * @param statement - Program body statement
     * @returns True when the statement ends the directive prologue
     */
    function isNonDirectivePrologueStatement(
      statement: t.Statement | t.ModuleDeclaration,
    ): boolean {
      if (!t.isExpressionStatement(statement)) return true;
      return !t.isStringLiteral(statement.expression);
    }

    const directivePrefixLength = body.findIndex(
      isNonDirectivePrologueStatement,
    );

    const index =
      directivePrefixLength === -1 ? body.length : directivePrefixLength;
    body.splice(index, 0, ...statements);
  }

  return {
    name: "@autotracer/plugin-babel-react19",
    visitor: {},
    parserOverride(
      code: string,
      parserOpts: ParserOptions,
      parse: (code: string, parserOpts: ParserOptions) => ParseResult | null,
    ) {
      /**
       * Reads an optional string property from an unknown object.
       *
       * @param value - Value to read from
       * @param key - Property key
       * @returns String value when present
       */
      function getOptionalStringProperty(
        value: unknown,
        key: string,
      ): string | undefined {
        if (typeof value !== "object" || value === null) return undefined;
        const prop = Reflect.get(value, key);
        return typeof prop === "string" ? prop : undefined;
      }

      /**
       * Derives a filename for diagnostics and filtering.
       *
       * @param opts - Parser options provided by Babel
       * @returns Filename string
       */
      function getFilenameFromParserOpts(opts: ParserOptions): string {
        return (
          getOptionalStringProperty(opts, "sourceFilename") ??
          getOptionalStringProperty(opts, "sourceFileName") ??
          getOptionalStringProperty(opts, "filename") ??
          "unknown.tsx"
        );
      }

      const filename = getFilenameFromParserOpts(parserOpts);
      try {
        // Only transform in development mode
        // if (process.env.NODE_ENV === "production") {
        //   return parse(code, parserOpts);
        // }
        if (process.env.TRACE_INJECT === "0") {
          return parse(code, parserOpts);
        }
        if (!shouldProcessFile(filename, config)) {
          return parse(code, parserOpts);
        }

        const result = transform(code, { filename, config, prefix: options.prefix });
        const codeToParse = result.code;

        // IMPORTANT: We intentionally bypass @babel/core.parse to avoid re-running the full
        // Babel transform pipeline (and thereby this plugin) on already transformed code.
        // Using @babel/parser directly ensures a single injection pass and prevents recursion.
        // We return the AST directly which satisfies Babel's parserOverride contract.
        // Side-effect: this path will NOT apply other parser stage transformations again.
        const ast = babelParser.parse(codeToParse, parserOpts);

        if (isOutputMode) {
          insertAfterDirectivePrologue(
            ast.program.body,
            createSeedOnlyStartupOutputModeStatements(outputMode),
          );
        }

        return ast;
      } catch (error) {
        console.warn(`Auto-trace transform failed for ${filename}:`, error);
        return parse(code, parserOpts);
      }
    },
  };
}

// Default export for ESM
export default reactTracerBabelPlugin;
