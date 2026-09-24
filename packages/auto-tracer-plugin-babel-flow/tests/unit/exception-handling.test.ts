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

describe("Exception Handling", () => {
  describe("basic exception logging", () => {
    it("should add catch block with traceException call", () => {
      const input = `
        function test() {
          riskyOperation();
        }
      `;
      const output = transform(input);

      expect(output).toContain("catch (e) {");
      expect(output).toContain(
        '__flowTracer.traceException("test", e, "debug")'
      );
      expect(output).toContain("throw e;");
    });

    it("should re-throw exception after logging", () => {
      const input = `
        function test() {
          doWork();
        }
      `;
      const output = transform(input);

      // Verify re-throw is present
      expect(output).toMatch(/catch\s*\(\s*e\s*\)\s*\{[\s\S]*throw\s+e;/);
    });

    it("should use function name in traceException", () => {
      const input = `
        function myCustomFunction() {
          work();
        }
      `;
      const output = transform(input);

      expect(output).toContain(
        '__flowTracer.traceException("myCustomFunction", e, "debug")'
      );
    });

    it("should handle arrow function exception logging", () => {
      const input = `
        const handler = () => {
          throw new Error("test");
        };
      `;
      const output = transform(input);

      expect(output).toContain(
        '__flowTracer.traceException("handler", e, "debug")'
      );
      expect(output).toContain("throw e;");
    });
  });

  describe("logExceptions configuration", () => {
    it("should omit catch block when logExceptions is false", () => {
      const input = `
        function test() {
          doWork();
        }
      `;
      const output = transform(input, { logExceptions: false });

      expect(output).not.toContain("catch (e)");
      expect(output).not.toContain("traceException");
      expect(output).toContain("try {");
      expect(output).toContain("finally {");
    });

    it("should include catch block by default", () => {
      const input = `
        function test() {
          doWork();
        }
      `;
      const output = transform(input);

      expect(output).toContain("catch (e) {");
      expect(output).toContain("traceException");
    });

    it("should respect logExceptions: true explicitly", () => {
      const input = `
        function test() {
          doWork();
        }
      `;
      const output = transform(input, { logExceptions: true });

      expect(output).toContain("catch (e) {");
      expect(output).toContain(
        '__flowTracer.traceException("test", e, "debug")'
      );
    });
  });

  describe("async function exceptions", () => {
    it("should handle async function exceptions", () => {
      const input = `
        async function fetchData() {
          const result = await fetch();
          return result;
        }
      `;
      const output = transform(input);

      expect(output).toContain("catch (e) {");
      expect(output).toContain(
        '__flowTracer.traceException("fetchData", e, "debug")'
      );
      expect(output).toContain("throw e;");
    });

    it("should handle async arrow function exceptions", () => {
      const input = `
        const loader = async () => {
          await load();
        };
      `;
      const output = transform(input);

      expect(output).toContain(
        '__flowTracer.traceException("loader", e, "debug")'
      );
    });

    it("should handle exception in async function with await", () => {
      const input = `
        async function process() {
          const a = await step1();
          const b = await step2();
          return a + b;
        }
      `;
      const output = transform(input);

      expect(output).toContain("catch (e) {");
      expect(output).toContain(
        '__flowTracer.traceException("process", e, "debug")'
      );
    });
  });

  describe("user's existing try/catch preservation", () => {
    it("should preserve user's try/catch block", () => {
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

      // User's code should be preserved
      expect(output).toContain("riskyOperation()");
      expect(output).toContain("handleError(error)");

      // Instrumentation should wrap everything
      expect(output).toContain('__flowTracer.enter("test")');
    });

    it("should preserve user's try/finally block", () => {
      const input = `
        function test() {
          try {
            doWork();
          } finally {
            cleanup();
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain("doWork()");
      expect(output).toContain("cleanup()");
    });

    it("should preserve user's try/catch/finally block", () => {
      const input = `
        function test() {
          try {
            riskyOperation();
          } catch (err) {
            logError(err);
          } finally {
            cleanup();
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain("riskyOperation()");
      expect(output).toContain("logError(err)");
      expect(output).toContain("cleanup()");
    });

    it("should handle nested user try/catch blocks", () => {
      const input = `
        function test() {
          try {
            outer();
          } catch (e1) {
            try {
              fallback();
            } catch (e2) {
              logError(e2);
            }
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain("outer()");
      expect(output).toContain("fallback()");
      expect(output).toContain("logError(e2)");
    });
  });

  describe("exception propagation", () => {
    it("should re-throw to maintain call stack", () => {
      const input = `
        function caller() {
          callee();
        }

        function callee() {
          throw new Error("test");
        }
      `;
      const output = transform(input);

      // Both functions should have throw e; in catch
      const throwStatements = output.match(/throw\s+e;/g);
      expect(throwStatements).toBeTruthy();
      expect(throwStatements!.length).toBeGreaterThanOrEqual(2);
    });

    it("should not swallow exceptions", () => {
      const input = `
        function test() {
          throw new Error("must propagate");
        }
      `;
      const output = transform(input);

      // Must have throw e; after traceException
      expect(output).toMatch(/traceException[\s\S]*throw\s+e;/);
    });
  });

  describe("exception with return statements", () => {
    it("should handle exception in function with early return", () => {
      const input = `
        function test(flag) {
          if (flag) return 1;
          riskyOperation();
          return 2;
        }
      `;
      const output = transform(input);

      expect(output).toContain("catch (e) {");
      expect(output).toContain(
        '__flowTracer.traceException("test", e, "debug")'
      );
    });

    it("should handle exception with multiple return paths", () => {
      const input = `
        function test(x) {
          if (x < 0) return -1;
          if (x === 0) return 0;
          return 1;
        }
      `;
      const output = transform(input);

      expect(output).toContain("catch (e) {");
      expect(output).toContain("throw e;");
    });
  });

  describe("custom tracer name with exceptions", () => {
    it("should use custom tracer name in traceException", () => {
      const input = `
        function test() {
          riskyOperation();
        }
      `;
      const output = transform(input, { tracerName: "myTracer" });

      expect(output).toContain('myTracer.traceException("test", e, "debug")');
      expect(output).not.toContain("__flowTracer.traceException");
    });

    it("should use custom tracer in async exceptions", () => {
      const input = `
        async function test() {
          await riskyAsync();
        }
      `;
      const output = transform(input, { tracerName: "customTracer" });

      expect(output).toContain(
        'customTracer.traceException("test", e, "debug")'
      );
    });
  });

  describe("class method exceptions", () => {
    it("should handle exceptions in class methods", () => {
      const input = `
        class Service {
          process() {
            riskyOperation();
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain(
        '__flowTracer.traceException("process", e, "debug")'
      );
    });

    it("should handle exceptions in async class methods", () => {
      const input = `
        class Service {
          async fetch() {
            await getData();
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain(
        '__flowTracer.traceException("fetch", e, "debug")'
      );
    });

    it("should handle exceptions in constructor", () => {
      const input = `
        class MyClass {
          constructor() {
            initialize();
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain(
        '__flowTracer.traceException("constructor", e, "debug")'
      );
    });
  });

  describe("generator and async generator exceptions", () => {
    it("should handle exceptions in generator functions", () => {
      const input = `
        function* numbers() {
          yield 1;
          throw new Error("generator error");
          yield 2;
        }
      `;
      const output = transform(input);

      expect(output).toContain(
        '__flowTracer.traceException("numbers", e, "debug")'
      );
    });

    it("should handle exceptions in async generators", () => {
      const input = `
        async function* stream() {
          yield await fetch();
          throw new Error("stream error");
        }
      `;
      const output = transform(input);

      expect(output).toContain(
        '__flowTracer.traceException("stream", e, "debug")'
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty function body with exception wrapper", () => {
      const input = `
        function empty() {}
      `;
      const output = transform(input);

      // Even empty functions get try/catch/finally
      expect(output).toContain("try {");
      expect(output).toContain("catch (e) {");
      expect(output).toContain("finally {");
    });

    it("should handle IIFE with exceptions", () => {
      const input = `
        (function() {
          riskyOperation();
        })();
      `;
      const output = transform(input);

      expect(output).toContain("catch (e) {");
      expect(output).toContain("traceException");
    });

    it("should handle function expression with exceptions", () => {
      const input = `
        const handler = function namedHandler() {
          throw new Error("test");
        };
      `;
      const output = transform(input);

      expect(output).toContain('traceException("handler", e, "debug")');
    });

    it("should handle object method with exceptions", () => {
      const input = `
        const obj = {
          method() {
            riskyOperation();
          }
        };
      `;
      const output = transform(input);

      expect(output).toContain(
        '__flowTracer.traceException("method", e, "debug")'
      );
    });
  });

  describe("exception with nested functions", () => {
    it("should add exception handling to all nested functions", () => {
      const input = `
        function outer() {
          function inner() {
            throw new Error("inner error");
          }
          inner();
        }
      `;
      const output = transform(input);

      // Both functions should have exception handling
      expect(output).toContain(
        '__flowTracer.traceException("outer", e, "debug")'
      );
      expect(output).toContain(
        '__flowTracer.traceException("outer:inner", e, "debug")'
      );
    });

    it("should maintain exception isolation in callbacks", () => {
      const input = `
        function process(items) {
          items.forEach((item) => {
            riskyTransform(item);
          });
        }
      `;
      const output = transform(input);

      // Both outer and callback should have exception handling
      const exceptionCalls = output.match(/traceException/g);
      expect(exceptionCalls).toBeTruthy();
      expect(exceptionCalls!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("finally block guarantee", () => {
    it("should ensure finally block executes for exit tracking", () => {
      const input = `
        function test() {
          riskyOperation();
        }
      `;
      const output = transform(input);

      // Finally must come after catch to ensure exit is always called
      expect(output).toMatch(/catch\s*\(\s*e\s*\)[\s\S]*finally/);
    });

    it("should call exit in finally even when exception occurs", () => {
      const input = `
        function test() {
          throw new Error("test");
        }
      `;
      const output = transform(input);

      // Finally block should contain exit call
      expect(output).toMatch(/finally\s*\{[\s\S]*__flowTracer\.exit/);
    });
  });
});
