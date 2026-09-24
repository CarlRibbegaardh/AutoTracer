import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import flowTracerBabelPlugin from "../../src/index";

/** Transforms code with the plugin. Options default to {} (opt-out mode). */
const transform = (
  code: string,
  options: Record<string, unknown> = {},
): string => {
  const result = transformSync(code, {
    plugins: [[flowTracerBabelPlugin, options]],
    filename: "test.ts",
    configFile: false,
    babelrc: false,
  });
  return result?.code ?? "";
};

/** Returns true when output contains instrumentation entry code. */
const isInstrumented = (output: string): boolean =>
  output.includes("__flowTracer.enter");

describe("Pragma support — canonical outcome matrix", () => {
  // | mode     | @trace-disable | @trace | Expected       |
  // |----------|----------------|--------|----------------|
  // | opt-out  | absent         | absent | INSTRUMENT     |
  // | opt-out  | present        | absent | SKIP           |
  // | opt-out  | absent         | present| INSTRUMENT     |
  // | opt-out  | present        | present| SKIP           |
  // | opt-in   | absent         | absent | SKIP           |
  // | opt-in   | absent         | present| INSTRUMENT     |
  // | opt-in   | present        | absent | SKIP           |
  // | opt-in   | present        | present| SKIP           |

  it("opt-out, no pragma → instruments", () => {
    const code = `function myFn() { return 1; }`;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(true);
  });

  it("opt-out, @trace-disable → skips", () => {
    const code = `
      // @trace-disable
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(false);
  });

  it("opt-out, @trace (no disable) → instruments", () => {
    const code = `
      // @trace
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(true);
  });

  it("opt-out, both @trace and @trace-disable → skips (disable wins)", () => {
    const code = `
      // @trace
      // @trace-disable
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(false);
  });

  it("opt-in, no pragma → skips", () => {
    const code = `function myFn() { return 1; }`;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(false);
  });

  it("opt-in, @trace → instruments", () => {
    const code = `
      // @trace
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(true);
  });

  it("opt-in, @trace-disable (no @trace) → skips", () => {
    const code = `
      // @trace-disable
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(false);
  });

  it("opt-in, both @trace and @trace-disable → skips (disable wins)", () => {
    const code = `
      // @trace
      // @trace-disable
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(false);
  });
});

describe("Pragma support — near-miss tokens must NOT trigger", () => {
  it("@traceable is NOT @trace in opt-in mode", () => {
    const code = `
      // @traceable
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(false);
  });

  it("@trace-disable-later is NOT @trace-disable in opt-out mode", () => {
    const code = `
      // @trace-disable-later
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(true);
  });
});

describe("Pragma support — block comments are ignored", () => {
  it("/** @trace */ does NOT enable in opt-in mode (block comment ignored)", () => {
    const code = `
      /** @trace */
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(false);
  });

  it("/** @trace-disable */ does NOT disable in opt-out mode (block comment ignored)", () => {
    const code = `
      /** @trace-disable */
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(true);
  });
});

describe("Pragma support — pragma after TSDoc is detected", () => {
  it("opt-in: @trace after a TSDoc block comment instruments the function", () => {
    const code = `
      /**
       * Does something.
       */
      // @trace
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(true);
  });

  it("opt-out: @trace-disable after a TSDoc block comment disables instrumentation", () => {
    const code = `
      /**
       * Does something.
       */
      // @trace-disable
      function myFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(false);
  });
});

describe("Pragma support — inheritance from enclosing function (cascade)", () => {
  it("@trace-disable on outer function cascades to inner function (opt-out)", () => {
    const code = `
      // @trace-disable
      function outer() {
        function inner() { return 1; }
        return inner();
      }
    `;
    const output = transform(code, { mode: "opt-out" });
    // Neither outer nor inner should be instrumented
    expect(output).not.toContain('__flowTracer.enter("outer")');
    expect(output).not.toContain('__flowTracer.enter("outer:inner")');
  });

  it("@trace-disable on outer does NOT prevent @trace-disable cascade even when inner has @trace", () => {
    const code = `
      // @trace-disable
      function outer() {
        // @trace
        function inner() { return 1; }
        return inner();
      }
    `;
    const output = transform(code, { mode: "opt-out" });
    // Ancestor @trace-disable cascades; inner @trace cannot re-enable
    expect(output).not.toContain('__flowTracer.enter("outer:inner")');
  });

  it("inner @trace enables function in opt-in when no ancestor @trace-disable", () => {
    const code = `
      function outer() {
        // @trace
        function inner() { return 1; }
        return inner();
      }
    `;
    const output = transform(code, { mode: "opt-in" });
    // outer has no pragma and mode is opt-in → outer not instrumented
    expect(output).not.toContain('__flowTracer.enter("outer")');
    // inner has @trace → inner instrumented
    expect(output).toContain('__flowTracer.enter("outer:inner")');
  });

  it("@trace on eligible ancestor enables descendant in opt-in", () => {
    const code = `
      // @trace
      function outer() {
        function inner() { return 1; }
        return inner();
      }
    `;
    const output = transform(code, { mode: "opt-in" });
    // outer has @trace → outer instrumented
    expect(output).toContain('__flowTracer.enter("outer")');
    // inner inherits ancestor @trace; no local disable → inner instrumented
    expect(output).toContain('__flowTracer.enter("outer:inner")');
  });
});

describe("Pragma support — all function-like host shapes", () => {
  it("opt-out: @trace-disable on FunctionDeclaration skips it", () => {
    const code = `
      // @trace-disable
      function declFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(false);
  });

  it("opt-in: @trace on FunctionExpression instruments it", () => {
    const code = `
      // @trace
      const exprFn = function() { return 1; };
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(true);
  });

  it("opt-in: @trace on ArrowFunctionExpression instruments it", () => {
    const code = `
      // @trace
      const arrowFn = () => { return 1; };
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(true);
  });

  it("opt-in: @trace on ObjectMethod instruments it", () => {
    const code = `
      const obj = {
        // @trace
        myMethod() { return 1; }
      };
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(true);
  });

  it("opt-in: @trace on ClassMethod instruments it", () => {
    const code = `
      class MyClass {
        // @trace
        myMethod() { return 1; }
      }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(true);
  });

  it("opt-in: named export FunctionDeclaration with @trace instruments it", () => {
    const code = `
      // @trace
      export function namedExportFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(true);
  });

  it("opt-out: @trace-disable on default export FunctionDeclaration skips it", () => {
    const code = `
      // @trace-disable
      export default function defaultExportFn() { return 1; }
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(false);
  });

  it("opt-out: @trace-disable on property-assignment FunctionExpression skips it", () => {
    const code = `
      // @trace-disable
      obj.propFn = function() { return 1; };
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(false);
  });
});

describe("Pragma support — eligibility gates apply before pragmas", () => {
  it("opt-in @trace on excluded function does NOT instrument (exclude wins)", () => {
    const code = `
      // @trace
      function excludedFn() { return 1; }
    `;
    // excludedFn is in the exclude list
    const output = transform(code, {
      mode: "opt-in",
      exclude: { functions: ["excludedFn"] },
    });
    expect(isInstrumented(output)).toBe(false);
  });

  it("opt-out no pragma on non-included function does NOT instrument (include wins)", () => {
    const code = `
      function notIncluded() { return 1; }
    `;
    const output = transform(code, {
      mode: "opt-out",
      include: { functions: ["handle*"] },
    });
    expect(isInstrumented(output)).toBe(false);
  });

  it("opt-in: @trace on excluded ancestor does NOT enable inner function", () => {
    // Ineligible ancestors (those that fail shouldInstrumentFunction) do not
    // propagate pragma state to their descendants.
    const code = `
      // @trace
      function excludedAncestor() {
        function inner() { return 1; }
        inner();
      }
    `;
    const output = transform(code, {
      mode: "opt-in",
      exclude: { functions: ["excludedAncestor"] },
    });
    // `inner` has no local @trace and its only ancestor is excluded — must not be instrumented
    const instrumented =
      output.includes("__flowTracer") && output.includes("inner");
    expect(instrumented).toBe(false);
  });
});

describe("Pragma support — call-argument callback host shapes", () => {
  it("opt-out: @trace-disable on ExpressionStatement before setTimeout callback skips it", () => {
    // The comment lives on the ExpressionStatement; getEffectiveCommentHost
    // walks up via the CallExpression branch to the ExpressionStatement host.
    const code = `
      // @trace-disable
      setTimeout(function() { return 1; }, 100);
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(false);
  });

  it("opt-in: @trace on ExpressionStatement before call-argument callback instruments it", () => {
    const code = `
      // @trace
      setTimeout(function() { return 1; }, 100);
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(true);
  });
});

describe("Pragma support — exported variable declarator host shape", () => {
  it("opt-out: @trace-disable on export const arrow skips it", () => {
    // Effective host is ExportNamedDeclaration; comment must be read from the wrapper node.
    const code = `
      // @trace-disable
      export const arrowFn = () => { return 1; };
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(false);
  });

  it("opt-in: @trace on export const arrow instruments it", () => {
    const code = `
      // @trace
      export const arrowFn = () => { return 1; };
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(true);
  });
});

describe("Pragma support — anonymous default export host shape", () => {
  it("opt-out: @trace-disable on export default arrow skips it", () => {
    // Effective host is ExportDefaultDeclaration; confirms the arrow inside is guarded.
    const code = `
      // @trace-disable
      export default () => { return 1; };
    `;
    expect(isInstrumented(transform(code, { mode: "opt-out" }))).toBe(false);
  });

  it("opt-in: @trace on export default arrow instruments it", () => {
    const code = `
      // @trace
      export default () => { return 1; };
    `;
    expect(isInstrumented(transform(code, { mode: "opt-in" }))).toBe(true);
  });
});

describe("Pragma support — eligibility applies to callback-chain normalized name", () => {
  it("opt-out: @trace-disable on include-matched callback skips it (pragma after eligibility)", () => {
    // The callback chain is App:handleClick:useCallback:anonymous.
    // extractFunctionNameFromChain produces "handleClick", which matches include["handle*"].
    // The function is eligible; the local @trace-disable pragma then skips it.
    const code = `
      function App() {
        const handleClick = useCallback(
          // @trace-disable
          function() { return 1; },
          []
        );
        return handleClick;
      }
    `;
    expect(
      isInstrumented(
        transform(code, {
          mode: "opt-out",
          include: { functions: ["handle*"] },
        }),
      ),
    ).toBe(false);
  });

  it("opt-in: @trace cannot enable a callback whose chain name does not match include.functions", () => {
    // The callback chain is App:onClick:useCallback:anonymous.
    // extractFunctionNameFromChain produces "onClick", which does NOT match include["handle*"].
    // The function is ineligible; @trace has no effect because eligibility is checked first.
    const code = `
      function App() {
        const onClick = useCallback(
          // @trace
          function() { return 1; },
          []
        );
        return onClick;
      }
    `;
    expect(
      isInstrumented(
        transform(code, {
          mode: "opt-in",
          include: { functions: ["handle*"] },
        }),
      ),
    ).toBe(false);
  });
});
