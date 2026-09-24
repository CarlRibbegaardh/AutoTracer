import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import flowTracerBabelPlugin from "../../src/index";

/**
 * Helper to transform code using the plugin
 */
function transform(code: string, options = {}) {
  const result = transformSync(code, {
    plugins: [[flowTracerBabelPlugin, options]],
    filename: "test.js",
    configFile: false,
    babelrc: false,
  });
  return result?.code ?? "";
}

describe("Babel Plugin Flow", () => {
  describe("function declarations", () => {
    it("should instrument function declarations", () => {
      const input = `
        function test() {
          console.log("hello");
        }
      `;
      const output = transform(input);

      expect(output).toContain("const __flowTracer = globalThis.__flowTracer");

      expect(output).toMatch(/const _h\d* = __flowTracer\.enter/);
      expect(output).toContain('__flowTracer.enter("test")');
      expect(output).toContain("try {");
      expect(output).toContain("catch (e) {");
      expect(output).toContain("finally {");
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });

    it("should wrap function body in try/catch/finally", () => {
      const input = `
        function test() {
          const x = 1;
          return x + 1;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/try\s*{[\s\S]*const x = 1/);
      expect(output).toMatch(/const _returnValue\d* = x \+ 1/);
      expect(output).toMatch(/return _returnValue\d*/);
      expect(output).toContain("catch (e)");
      expect(output).toContain("finally");
    });
  });

  describe("function expressions", () => {
    it("should instrument named function expressions", () => {
      const input = `
        const foo = function bar() {
          return 42;
        };
      `;
      const output = transform(input);

      // Named function expressions use the variable name, not the function name
      expect(output).toContain('__flowTracer.enter("foo")');
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });

    it("should instrument anonymous function expressions with variable name", () => {
      const input = `
        const myFunc = function() {
          return 42;
        };
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("myFunc")');
    });
  });

  describe("arrow functions", () => {
    it("should instrument arrow functions with block body", () => {
      const input = `
        const test = () => {
          return 42;
        };
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("test")');
      expect(output).toContain("try {");
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });

    it("should convert arrow function expression body to block", () => {
      const input = `
        const add = (a, b) => a + b;
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("add"');
      expect(output).toContain('__flowTracer.traceParameter("a", a)');
      expect(output).toContain('__flowTracer.traceParameter("b", b)');
      expect(output).toMatch(/const _returnValue\d* = a \+ b/);
      expect(output).toMatch(
        /__flowTracer\.traceReturnValue\(_returnValue\d*\)/,
      );
      expect(output).toMatch(/return _returnValue\d*/);
      expect(output).toContain("try {");
      expect(output).toContain("finally {");
    });
  });

  describe("object methods", () => {
    it("should instrument object methods", () => {
      const input = `
        const obj = {
          myMethod() {
            return 42;
          }
        };
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("myMethod")');
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });
  });

  describe("class methods", () => {
    it("should instrument class methods", () => {
      const input = `
        class MyClass {
          myMethod() {
            return 42;
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("myMethod")');
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });

    it("should instrument class constructor", () => {
      const input = `
        class MyClass {
          constructor() {
            this.value = 42;
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("constructor")');
    });
  });

  describe("exception logging", () => {
    it("should include catch block by default", () => {
      const input = `
        function test() {
          doWork();
        }
      `;
      const output = transform(input);

      expect(output).toContain("catch (e) {");
      expect(output).toContain(
        '__flowTracer.traceException("test", e, "debug")',
      );
      expect(output).toContain("throw e;");
    });

    it("should omit catch block when logExceptions is false", () => {
      const input = `
        function test() {
          doWork();
        }
      `;
      const output = transform(input, { logExceptions: false });

      expect(output).not.toContain("catch (e)");
      expect(output).toContain("try {");
      expect(output).toContain("finally {");
    });
  });

  describe("configuration", () => {
    it("should use custom tracer name", () => {
      const input = `
        function test() {
          return 42;
        }
      `;
      const output = transform(input, { tracerName: "myTracer" });

      expect(output).toContain('myTracer.enter("test")');
      expect(output).toMatch(/myTracer\.exit\(_h\d*\)/);
      expect(output).toContain('myTracer.traceException("test", e, "debug")');
    });

    it("should inject startup outputMode for flow runtime modules", () => {
      const input = `
        import "@autotracer/flow/runtime";

        export function test() {
          return 42;
        }
      `;

      const output = transform(input, { outputMode: "copy-paste" });

      expect(output).toContain("__autoTracerInternal");
      expect(output).toContain('setOutputMode("copy-paste")');
      expect(output).not.toContain("__flowTracer.enter");
    });
  });

  describe("function name extraction", () => {
    it("should use 'anonymous' for unnamed functions", () => {
      const input = `
        setTimeout(function() {
          console.log("hello");
        }, 1000);
      `;
      const output = transform(input);

      // Anonymous function passed to setTimeout includes the call in the name
      expect(output).toContain('__flowTracer.enter("setTimeout:anonymous")');
    });

    it("should extract name from property assignment", () => {
      const input = `
        obj.method = function() {
          return 42;
        };
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("method")');
    });
  });

  describe("edge cases", () => {
    it("should handle empty function", () => {
      const input = `
        function empty() {}
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("empty")');
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });

    it("should handle function with multiple statements", () => {
      const input = `
        function complex() {
          const a = 1;
          const b = 2;
          if (a < b) {
            return a + b;
          }
          return a - b;
        }
      `;
      const output = transform(input);

      expect(output).toContain("const a = 1");
      expect(output).toContain("const b = 2");
      expect(output).toContain("if (a < b)");
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });

    it("should preserve existing try/catch blocks", () => {
      const input = `
        function test() {
          try {
            riskyOperation();
          } catch (error) {
            handleError(error);
          }
        }
      `;
      const output = transform(input);

      // Should have both: user's try/catch AND instrumentation try/catch
      expect(output).toContain("riskyOperation()");
      expect(output).toContain("handleError(error)");
      expect(output).toContain('__flowTracer.enter("test")');
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });
  });

  describe("nested functions", () => {
    it("should use colon-separated names for nested functions", () => {
      const input = `
        function outer() {
          const inner = () => {
            console.log("nested");
          };
          inner();
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("outer")');
      expect(output).toContain('__flowTracer.enter("outer:inner")');
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });

    it("should handle multiple nesting levels", () => {
      const input = `
        function level1() {
          function level2() {
            const level3 = () => {
              return 42;
            };
            return level3();
          }
          return level2();
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("level1")');
      expect(output).toContain('__flowTracer.enter("level1:level2")');
      expect(output).toContain('__flowTracer.enter("level1:level2:level3")');
    });

    it("should handle nested anonymous functions", () => {
      const input = `
        function outer() {
          const arr = [1, 2, 3].map(x => x * 2);
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("outer")');
      // Includes variable name 'arr' and method 'map' in the chain
      expect(output).toContain('__flowTracer.enter("outer:arr:map:anonymous"');
    });

    it("should include function call names in nested chain", () => {
      const input = `
        function App() {
          const handleClick = useCallback(() => {
            console.log("clicked");
          });
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("App")');
      expect(output).toContain(
        '__flowTracer.enter("App:handleClick:useCallback:anonymous"',
      );
    });

    it("should handle useMemo callbacks", () => {
      const input = `
        function Component() {
          const value = useMemo(() => {
            return expensiveCalculation();
          });
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("Component")');
      expect(output).toContain(
        '__flowTracer.enter("Component:value:useMemo:anonymous"',
      );
    });

    it("should handle useEffect callbacks", () => {
      const input = `
        function Component() {
          useEffect(() => {
            console.log("effect");
          });
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("Component")');
      expect(output).toContain(
        '__flowTracer.enter("Component:useEffect:anonymous"',
      );
    });

    it("should handle nested map callbacks", () => {
      const input = `
        function processData() {
          const results = items.map(item => item * 2);
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("processData")');
      // Includes variable name 'results' and method 'map' in the chain
      expect(output).toContain(
        '__flowTracer.enter("processData:results:map:anonymous"',
      );
    });
  });
});
