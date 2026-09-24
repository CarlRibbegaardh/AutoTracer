import * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";
import type { NormalizedBabelPluginFlowConfig } from "./types/index.js";

/**
 * Creates the canonical Flow tracer expression used by injected code.
 *
 * Output shape: `globalThis.__flowTracer`
 *
 * @returns MemberExpression pointing at the canonical global Flow tracer
 */
function createGlobalFlowTracerExpression(): t.MemberExpression {
  return t.memberExpression(
    t.identifier("globalThis"),
    t.identifier("__flowTracer")
  );
}

/**
 * Checks whether an expression matches `globalThis.__flowTracer`.
 *
 * @param expr - Expression to check
 * @returns True when expression matches the canonical Flow tracer expression
 */
function isGlobalFlowTracerExpression(expr: t.Expression): boolean {
  if (!t.isMemberExpression(expr)) {
    return false;
  }

  if (!t.isIdentifier(expr.property, { name: "__flowTracer" })) {
    return false;
  }

  return t.isIdentifier(expr.object, { name: "globalThis" });
}

/**
 * Recursively extracts all identifier nodes from a destructuring pattern.
 * Handles object patterns, array patterns, nested patterns, rest elements, and renames.
 *
 * @param pattern - The destructuring pattern to extract identifiers from
 * @returns Array of objects with identifier and optional prefix (for rest elements)
 */
function extractIdentifiersFromPattern(
  pattern: t.ObjectPattern | t.ArrayPattern
): Array<{ identifier: t.Identifier; prefix?: string }> {
  const identifiers: Array<{ identifier: t.Identifier; prefix?: string }> = [];

  if (t.isObjectPattern(pattern)) {
    for (const prop of pattern.properties) {
      if (t.isObjectProperty(prop)) {
        const value = prop.value;
        if (t.isIdentifier(value)) {
          // Simple property: { name }
          identifiers.push({ identifier: value });
        } else if (t.isAssignmentPattern(value)) {
          // Property with default: { name = "default" }
          if (t.isIdentifier(value.left)) {
            identifiers.push({ identifier: value.left });
          } else if (
            t.isObjectPattern(value.left) ||
            t.isArrayPattern(value.left)
          ) {
            // Nested destructuring with default: { user: { name } = {} }
            identifiers.push(...extractIdentifiersFromPattern(value.left));
          }
        } else if (t.isObjectPattern(value) || t.isArrayPattern(value)) {
          // Nested destructuring: { user: { name } }
          identifiers.push(...extractIdentifiersFromPattern(value));
        }
      } else if (t.isRestElement(prop)) {
        // Rest in object: { name, ...rest }
        if (t.isIdentifier(prop.argument)) {
          identifiers.push({ identifier: prop.argument, prefix: "..." });
        }
      }
    }
  } else if (t.isArrayPattern(pattern)) {
    for (const element of pattern.elements) {
      if (!element) {
        // Hole in array: [a, , c]
        continue;
      }
      if (t.isIdentifier(element)) {
        // Simple element: [a, b]
        identifiers.push({ identifier: element });
      } else if (t.isAssignmentPattern(element)) {
        // Element with default: [a = 1, b = 2]
        if (t.isIdentifier(element.left)) {
          identifiers.push({ identifier: element.left });
        } else if (
          t.isObjectPattern(element.left) ||
          t.isArrayPattern(element.left)
        ) {
          // Nested destructuring with default: [[a, b] = []]
          identifiers.push(...extractIdentifiersFromPattern(element.left));
        }
      } else if (t.isObjectPattern(element) || t.isArrayPattern(element)) {
        // Nested destructuring: [[a, b], [c, d]]
        identifiers.push(...extractIdentifiersFromPattern(element));
      } else if (t.isRestElement(element)) {
        // Rest in array: [head, ...tail]
        if (t.isIdentifier(element.argument)) {
          identifiers.push({ identifier: element.argument, prefix: "..." });
        }
      }
    }
  }

  return identifiers;
}

/**
 * Creates instrumentation code for function entry.
 * Pure function that generates AST nodes.
 *
 * @param functionName - Name of function being instrumented
 * @param params - Function parameter nodes
 * @param handleId - Unique identifier for the handle variable
 * @returns Array of AST statements for enter() and parameter logging
 */
function createEnterStatement(
  tracerName: string,
  functionName: string,
  params: readonly (
    | t.Identifier
    | t.Pattern
    | t.RestElement
    | t.TSParameterProperty
  )[],
  handleId: t.Identifier
): t.Statement[] {
  const statements: t.Statement[] = [];

  // const h0 = __flowTracer.enter("functionName");
  statements.push(
    t.variableDeclaration("const", [
      t.variableDeclarator(
        handleId,
        t.callExpression(
          t.memberExpression(t.identifier(tracerName), t.identifier("enter")),
          [t.stringLiteral(functionName)]
        )
      ),
    ])
  );

  // __flowTracer.traceParameter("param1", param1);
  for (const param of params) {
    if (t.isIdentifier(param)) {
      statements.push(
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(
              t.identifier(tracerName),
              t.identifier("traceParameter")
            ),
            [t.stringLiteral(param.name), param]
          )
        )
      );
    } else if (t.isRestElement(param)) {
      if (t.isIdentifier(param.argument)) {
        statements.push(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier(tracerName),
                t.identifier("traceParameter")
              ),
              [t.stringLiteral(`...${param.argument.name}`), param.argument]
            )
          )
        );
      }
    } else if (t.isAssignmentPattern(param)) {
      // Handle default parameters: function(name = "default")
      // The left side is the parameter identifier, right side is the default value
      if (t.isIdentifier(param.left)) {
        statements.push(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier(tracerName),
                t.identifier("traceParameter")
              ),
              [t.stringLiteral(param.left.name), param.left]
            )
          )
        );
      } else if (
        t.isObjectPattern(param.left) ||
        t.isArrayPattern(param.left)
      ) {
        // Handle destructuring with defaults: function({ name = "default" })
        const identifiers = extractIdentifiersFromPattern(param.left);
        for (const { identifier, prefix } of identifiers) {
          const paramName = prefix
            ? `${prefix}${identifier.name}`
            : identifier.name;
          statements.push(
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(
                  t.identifier(tracerName),
                  t.identifier("traceParameter")
                ),
                [t.stringLiteral(paramName), identifier]
              )
            )
          );
        }
      }
    } else if (t.isObjectPattern(param) || t.isArrayPattern(param)) {
      // Handle object/array destructuring: function({ name, age }), function([a, b])
      const identifiers = extractIdentifiersFromPattern(param);
      for (const { identifier, prefix } of identifiers) {
        const paramName = prefix
          ? `${prefix}${identifier.name}`
          : identifier.name;
        statements.push(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier(tracerName),
                t.identifier("traceParameter")
              ),
              [t.stringLiteral(paramName), identifier]
            )
          )
        );
      }
    }
    // Skip other patterns (TS-specific) - would need deeper traversal
  }

  return statements;
}

/**
 * Creates instrumentation code for function exit.
 * Pure function that generates AST nodes.
 *
 * @param handleId - Unique identifier for the handle variable
 * @returns AST statement for exit() call
 */
function createExitStatement(
  tracerName: string,
  handleId: t.Identifier
): t.ExpressionStatement {
  // __flowTracer.exit(h0);
  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(t.identifier(tracerName), t.identifier("exit")),
      [handleId]
    )
  );
}

/**
 * Creates exception logging statement.
 * Pure function that generates AST nodes.
 *
 * @param functionName - Name of function
 * @param logLevel - Log level for the exception (debug, warn, error)
 * @returns AST statement for exception logging
 */
function createExceptionLogStatement(
  tracerName: string,
  functionName: string,
  logLevel: "debug" | "warn" | "error"
): t.ExpressionStatement {
  // __flowTracer.traceException("functionName", e, "debug");
  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(
        t.identifier(tracerName),
        t.identifier("traceException")
      ),
      [t.stringLiteral(functionName), t.identifier("e"), t.stringLiteral(logLevel)]
    )
  );
}

/**
 * Instruments return statements to capture and log return values.
 * Generates AST nodes with a unique variable name.
 *
 * @param returnStmt - Original return statement
 * @param returnPath - Path to the return statement (for generating unique ID)
 * @returns Array of statements to replace the return
 */
function instrumentReturnStatement(
  returnStmt: t.ReturnStatement,
  tracerName: string,
  returnPath: NodePath<t.ReturnStatement>
): t.Statement[] {
  if (!returnStmt.argument) {
    // return; (no value)
    return [returnStmt];
  }

  // Generate a unique variable name using Babel's scope
  const scope = returnPath.scope;
  const uniqueVarName = scope.generateUidIdentifier("returnValue");

  // return value; → const _returnValue = value; __flowTracer.trace("returned:", _returnValue); return _returnValue;
  return [
    t.variableDeclaration("const", [
      t.variableDeclarator(uniqueVarName, returnStmt.argument),
    ]),
    t.expressionStatement(
      t.callExpression(
        t.memberExpression(
          t.identifier(tracerName),
          t.identifier("traceReturnValue")
        ),
        [uniqueVarName]
      )
    ),
    t.returnStatement(uniqueVarName),
  ];
}

/**
 * Gets a descriptive name for a call expression.
 * Pure function that extracts function name from AST.
 *
 * @param callExpr - Call expression node
 * @returns Function name or description
 */
function getCallExpressionName(callExpr: t.CallExpression): string {
  const callee = callExpr.callee;

  if (t.isIdentifier(callee)) {
    // Simple call: foo()
    return callee.name;
  } else if (t.isMemberExpression(callee)) {
    // Method call: obj.method()
    if (t.isIdentifier(callee.property)) {
      return callee.property.name;
    } else if (t.isStringLiteral(callee.property)) {
      return callee.property.value;
    }
  }

  return "anonymous";
}

/**
 * Creates async function entry trace statement.
 * Pure function that generates AST nodes.
 *
 * @param functionName - Name of function
 * @param params - Function parameter nodes
 * @param handleId - Unique identifier for the handle variable
 * @returns Array of AST statements for async entry and parameter logging
 */
function createAsyncEnterStatement(
  tracerName: string,
  functionName: string,
  params: readonly (
    | t.Identifier
    | t.Pattern
    | t.RestElement
    | t.TSParameterProperty
  )[],
  handleId: t.Identifier
): t.Statement[] {
  const statements: t.Statement[] = [];

  // const h0 = __flowTracer.enterAsync("functionName");
  statements.push(
    t.variableDeclaration("const", [
      t.variableDeclarator(
        handleId,
        t.callExpression(
          t.memberExpression(
            t.identifier(tracerName),
            t.identifier("enterAsync")
          ),
          [t.stringLiteral(functionName)]
        )
      ),
    ])
  );

  // __flowTracer.traceParameter("param1", param1);
  for (const param of params) {
    if (t.isIdentifier(param)) {
      statements.push(
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(
              t.identifier(tracerName),
              t.identifier("traceParameter")
            ),
            [t.stringLiteral(param.name), param]
          )
        )
      );
    } else if (t.isRestElement(param)) {
      if (t.isIdentifier(param.argument)) {
        statements.push(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier(tracerName),
                t.identifier("traceParameter")
              ),
              [t.stringLiteral(`...${param.argument.name}`), param.argument]
            )
          )
        );
      }
    }
  }

  return statements;
}

/**
 * Creates async function exit trace statement.
 * Pure function that generates AST nodes.
 *
 * @param handleId - Unique identifier for the handle variable
 * @returns AST statement for async exit trace
 */
function createAsyncExitStatement(
  tracerName: string,
  handleId: t.Identifier
): t.ExpressionStatement {
  // __flowTracer.exitAsync(h0);
  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(t.identifier(tracerName), t.identifier("exitAsync")),
      [handleId]
    )
  );
}

/**
 * Recursively instruments all return statements within a function body.
 * Does NOT cross function boundaries (nested functions are handled separately).
 * Pure function that traverses and replaces return statements.
 *
 * @param bodyPath - Path to the function's BlockStatement body
 * @param functionPath - Path to the function itself (to detect boundaries)
 */
function instrumentAllReturnsInBody(
  bodyPath: NodePath,
  functionPath: NodePath,
  tracerName: string
): void {
  // Collect all return statements first to avoid revisiting newly created nodes
  const returnStatements: NodePath<t.ReturnStatement>[] = [];

  bodyPath.traverse({
    ReturnStatement(returnPath) {
      // Skip if this return belongs to a nested function (don't cross boundaries)
      const returnFunctionParent = returnPath.getFunctionParent();
      if (returnFunctionParent?.node !== functionPath.node) {
        return;
      }

      // Only instrument returns with values (skip empty returns)
      if (!returnPath.node.argument) {
        return;
      }

      // Collect for later instrumentation
      returnStatements.push(returnPath);
    },
  });

  // Now instrument all collected returns (prevents infinite recursion)
  for (const returnPath of returnStatements) {
    const instrumented = instrumentReturnStatement(
      returnPath.node,
      tracerName,
      returnPath
    );
    returnPath.replaceWithMultiple(instrumented);
  }
}

/**
 * Wraps function body in try/catch/finally for flow tracking.
 * Mutates the function body AST in place.
 *
 * @param path - Babel path to function
 * @param functionName - Name of function
 * @param config - Plugin configuration
 */
export function instrumentFunctionBody(
  path:
    | NodePath<t.FunctionDeclaration>
    | NodePath<t.FunctionExpression>
    | NodePath<t.ArrowFunctionExpression>
    | NodePath<t.ObjectMethod>
    | NodePath<t.ClassMethod>,
  functionName: string,
  config: NormalizedBabelPluginFlowConfig
): void {
  const body = path.node.body;
  const isAsync = path.node.async;

  // Skip if not a block statement (e.g., arrow function with expression body)
  if (!t.isBlockStatement(body)) {
    // Convert expression body to block statement
    if (t.isArrowFunctionExpression(path.node)) {
      if (!t.isExpression(body)) {
        return;
      }
      path.node.body = t.blockStatement([
        t.returnStatement(body),
      ]);
    } else {
      return; // Can't instrument non-block bodies
    }
  }

  if (!t.isBlockStatement(path.node.body)) {
    return;
  }

  const blockBody = path.node.body;

  // Resolve the tracer identifier locally from the canonical global.
  const tracerBinding = t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier(config.tracerName),
      createGlobalFlowTracerExpression()
    ),
  ]);

  // Get the body path for traversal
  const bodyPath = path.get("body");
  if (Array.isArray(bodyPath)) {
    return;
  }

  // Recursively instrument all return statements at any nesting depth
  instrumentAllReturnsInBody(bodyPath, path, config.tracerName);

  // Get the (now instrumented) statements from the body
  const instrumentedStatements = blockBody.body;

  // Async functions use flat trace logging instead of enter/exit groups
  if (isAsync) {
    // Generate unique handle identifier to avoid collisions
    const handleId = path.scope.generateUidIdentifier("h");

    const asyncEnterStmts = createAsyncEnterStatement(
      config.tracerName,
      functionName,
      path.node.params,
      handleId
    );
    const asyncExitStmt = createAsyncExitStatement(config.tracerName, handleId);

    if (config.logExceptions) {
      const catchClause = t.catchClause(
        t.identifier("e"),
        t.blockStatement([
          createExceptionLogStatement(config.tracerName, functionName, config.exceptionLogLevel),
          t.throwStatement(t.identifier("e")),
        ])
      );

      const tryStatement = t.tryStatement(
        t.blockStatement(instrumentedStatements),
        catchClause,
        t.blockStatement([asyncExitStmt])
      );

      blockBody.body = [...asyncEnterStmts, tryStatement];
    } else {
      const tryStatement = t.tryStatement(
        t.blockStatement(instrumentedStatements),
        null,
        t.blockStatement([asyncExitStmt])
      );

      blockBody.body = [...asyncEnterStmts, tryStatement];
    }

    blockBody.body = [tracerBinding, ...blockBody.body];
    return;
  }

  // Generate unique handle identifier to avoid collisions
  const handleId = path.scope.generateUidIdentifier("h");

  // Regular (non-async) functions use enter/exit groups
  const enterStmts = createEnterStatement(
    config.tracerName,
    functionName,
    path.node.params,
    handleId
  );

  const exitStmt = createExitStatement(config.tracerName, handleId);

  if (config.logExceptions) {
    // Strategy A: try/catch/finally
    const catchClause = t.catchClause(
      t.identifier("e"),
      t.blockStatement([
        createExceptionLogStatement(config.tracerName, functionName, config.exceptionLogLevel),
        t.throwStatement(t.identifier("e")),
      ])
    );

    const tryStatement = t.tryStatement(
      t.blockStatement(instrumentedStatements),
      catchClause,
      t.blockStatement([exitStmt])
    );

    blockBody.body = [tracerBinding, ...enterStmts, tryStatement];
  } else {
    // Strategy B: try/finally only
    const tryStatement = t.tryStatement(
      t.blockStatement(instrumentedStatements),
      null,
      t.blockStatement([exitStmt])
    );

    blockBody.body = [tracerBinding, ...enterStmts, tryStatement];
  }
}

/**
 * Instruments a call expression to log before and after execution.
 * Replaces the call with an IIFE that captures and logs the result.
 *
 * @param callPath - Path to the call expression
 * @param tracerName - Name of global tracer variable
 */
export function instrumentCallExpressionPath(
  callPath: NodePath<t.CallExpression>,
): void {
  const callExpr = callPath.node;
  const functionName = getCallExpressionName(callExpr);

  // Skip calls to the tracer itself to avoid infinite recursion
  if (
    t.isMemberExpression(callExpr.callee) &&
    t.isExpression(callExpr.callee.object) &&
    isGlobalFlowTracerExpression(callExpr.callee.object)
  ) {
    return;
  }

  // Create: (() => {
  //   __flowTracer.trace("→ fnName(", ...args);
  //   const __result = originalCall(...args);
  //   __flowTracer.trace("← fnName returned:", __result);
  //   return __result;
  // })()

  const logBefore = t.expressionStatement(
    t.callExpression(
      t.memberExpression(createGlobalFlowTracerExpression(), t.identifier("trace")),
      [
        t.stringLiteral(`→ ${functionName}(`),
        ...callExpr.arguments,
      ]
    )
  );

  const captureResult = t.variableDeclaration("const", [
    t.variableDeclarator(t.identifier("__callResult"), callExpr),
  ]);

  const logAfter = t.expressionStatement(
    t.callExpression(
      t.memberExpression(createGlobalFlowTracerExpression(), t.identifier("trace")),
      [
        t.stringLiteral(`← ${functionName} returned:`),
        t.identifier("__callResult"),
      ]
    )
  );

  const returnResult = t.returnStatement(t.identifier("__callResult"));

  const iife = t.callExpression(
    t.arrowFunctionExpression(
      [],
      t.blockStatement([logBefore, captureResult, logAfter, returnResult])
    ),
    []
  );

  callPath.replaceWith(iife);
  callPath.skip(); // Prevent traversing into the IIFE to avoid infinite recursion
}
