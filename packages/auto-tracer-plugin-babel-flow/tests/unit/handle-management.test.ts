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

describe("Handle Management", () => {
  describe("basic handle generation", () => {
    it("should generate unique handle variable for function", () => {
      const input = `
        function test() {
          return 42;
        }
      `;
      const output = transform(input);

      // Should create handle variable (Babel generates _h, _h2, etc.)
      expect(output).toMatch(/const _h\d* = __flowTracer\.enter/);
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });

    it("should use same handle for enter and exit", () => {
      const input = `
        function test() {
          return 42;
        }
      `;
      const output = transform(input);

      // Extract handle name from enter call
      const enterMatch = output.match(/const (_h\d*) = __flowTracer\.enter/);
      expect(enterMatch).toBeTruthy();
      const handleName = enterMatch![1];

      // Verify same handle used in exit
      expect(output).toContain(`__flowTracer.exit(${handleName})`);
    });

    it("should generate handle for async functions", () => {
      const input = `
        async function fetchData() {
          return await fetch();
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _h\d* = __flowTracer\.enterAsync/);
      expect(output).toMatch(/__flowTracer\.exitAsync\(_h\d*\)/);
    });

    it("should generate handle for arrow functions", () => {
      const input = `
        const double = (x) => x * 2;
      `;
      const output = transform(input);

      expect(output).toMatch(/const _h\d* = __flowTracer\.enter/);
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });

    it("should generate handle for class methods", () => {
      const input = `
        class Calculator {
          add(a, b) {
            return a + b;
          }
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _h\d* = __flowTracer\.enter/);
      expect(output).toMatch(/__flowTracer\.exit\(_h\d*\)/);
    });
  });

  describe("handle collision avoidance", () => {
    it("should avoid collision with user's h0 variable", () => {
      const input = `
        function test() {
          const h0 = 42;
          return h0 * 2;
        }
      `;
      const output = transform(input);

      // Should generate different handle name to avoid collision
      const handleMatch = output.match(/const (_h\d*) = __flowTracer\.enter/);
      expect(handleMatch).toBeTruthy();
      const generatedHandle = handleMatch![1];

      // User's h0 should still exist
      expect(output).toContain("const h0 = 42");

      // Should not be the same variable (Babel generates _h not h0)
      expect(generatedHandle).not.toBe("h0");
    });

    it("should avoid collision with user's h1 variable", () => {
      const input = `
        function test() {
          const h1 = "test";
          return h1.length;
        }
      `;
      const output = transform(input);

      const handleMatch = output.match(/const (_h\d*) = __flowTracer\.enter/);
      expect(handleMatch).toBeTruthy();
      const generatedHandle = handleMatch![1];

      expect(output).toContain('const h1 = "test"');
      expect(generatedHandle).not.toBe("h1");
    });

    it("should avoid collision with multiple user variables", () => {
      const input = `
        function test() {
          const h0 = 1;
          const h1 = 2;
          const h2 = 3;
          return h0 + h1 + h2;
        }
      `;
      const output = transform(input);

      const handleMatch = output.match(/const (_h\d*) = __flowTracer\.enter/);
      expect(handleMatch).toBeTruthy();
      const generatedHandle = handleMatch![1];

      // Babel generates _h which doesn't collide with h0, h1, h2
      expect(output).toContain("const h0 = 1");
      expect(output).toContain("const h1 = 2");
      expect(output).toContain("const h2 = 3");
      expect(["h0", "h1", "h2"]).not.toContain(generatedHandle);
    });
  });

  describe("nested functions", () => {
    it("should generate different handles for nested functions", () => {
      const input = `
        function outer() {
          function inner() {
            return 1;
          }
          return inner();
        }
      `;
      const output = transform(input);

      // Should have two different handles
      const handles = output.match(/const _h\d* = __flowTracer\.enter/g);
      expect(handles).toBeTruthy();
      expect(handles!.length).toBe(2);

      // Extract the actual handle names
      const handleNames = Array.from(
        output.matchAll(/const (_h\d*) = __flowTracer\.enter/g)
      ).map((match) => match[1]);

      // Should be different
      expect(handleNames[0]).not.toBe(handleNames[1]);
    });

    it("should isolate handles in nested arrow functions", () => {
      const input = `
        function process(items) {
          return items.map((item) => item * 2);
        }
      `;
      const output = transform(input);

      const handles = output.match(/const _h\d* = __flowTracer\.enter/g);
      expect(handles).toBeTruthy();
      // Outer function + arrow function callback
      expect(handles!.length).toBe(2);
    });

    it("should handle deeply nested functions", () => {
      const input = `
        function level1() {
          function level2() {
            function level3() {
              return 42;
            }
            return level3();
          }
          return level2();
        }
      `;
      const output = transform(input);

      const handles = output.match(/const _h\d* = __flowTracer\.enter/g);
      expect(handles).toBeTruthy();
      expect(handles!.length).toBe(3);

      // All handles should be unique
      const handleNames = Array.from(
        output.matchAll(/const (_h\d*) = __flowTracer\.enter/g)
      ).map((match) => match[1]);

      const uniqueHandles = new Set(handleNames);
      expect(uniqueHandles.size).toBe(3);
    });

    it("should handle nested async functions", () => {
      const input = `
        async function outer() {
          async function inner() {
            return await fetch();
          }
          return await inner();
        }
      `;
      const output = transform(input);

      // Both should use enterAsync
      const asyncHandles = output.match(/const _h\d* = __flowTracer\.enterAsync/g);
      expect(asyncHandles).toBeTruthy();
      expect(asyncHandles!.length).toBe(2);
    });
  });

  describe("multiple functions in same scope", () => {
    it("should generate unique handles for sibling functions", () => {
      const input = `
        function first() {
          return 1;
        }

        function second() {
          return 2;
        }

        function third() {
          return 3;
        }
      `;
      const output = transform(input);

      const handles = output.match(/const (_h\d*) = __flowTracer\.enter/g);
      expect(handles).toBeTruthy();
      expect(handles!.length).toBe(3);

      const handleNames = Array.from(
        output.matchAll(/const (_h\d*) = __flowTracer\.enter/g)
      ).map((match) => match[1]);

      const uniqueHandles = new Set(handleNames);
      expect(uniqueHandles.size).toBe(3);
    });

    it("should handle multiple methods in class", () => {
      const input = `
        class Service {
          method1() {
            return 1;
          }

          method2() {
            return 2;
          }

          async method3() {
            return 3;
          }
        }
      `;
      const output = transform(input);

      // Each method gets its own handle (scoped to method body)
      const syncHandles = output.match(/const _h\d* = __flowTracer\.enter\("method/g);
      const asyncHandles = output.match(/const _h\d* = __flowTracer\.enterAsync\("method/g);

      expect(syncHandles?.length).toBe(2);
      expect(asyncHandles?.length).toBe(1);
    });
  });

  describe("recursive functions", () => {
    it("should handle recursive function calls correctly", () => {
      const input = `
        function factorial(n) {
          if (n <= 1) return 1;
          return n * factorial(n - 1);
        }
      `;
      const output = transform(input);

      // Should generate one handle per call (at runtime)
      // But only one handle variable declaration in the code
      const handles = output.match(/const (_h\d*) = __flowTracer\.enter/g);
      expect(handles).toBeTruthy();
      expect(handles!.length).toBe(1);
    });

    it("should handle mutually recursive functions", () => {
      const input = `
        function isEven(n) {
          if (n === 0) return true;
          return isOdd(n - 1);
        }

        function isOdd(n) {
          if (n === 0) return false;
          return isEven(n - 1);
        }
      `;
      const output = transform(input);

      const handles = output.match(/const (_h\d*) = __flowTracer\.enter/g);
      expect(handles).toBeTruthy();
      expect(handles!.length).toBe(2);

      const handleNames = Array.from(
        output.matchAll(/const (_h\d*) = __flowTracer\.enter/g)
      ).map((match) => match[1]);

      // Different functions should have different handles
      expect(handleNames[0]).not.toBe(handleNames[1]);
    });
  });

  describe("async context", () => {
    it("should maintain handle across await boundaries", () => {
      const input = `
        async function process() {
          const data = await fetch();
          const result = await transform(data);
          return result;
        }
      `;
      const output = transform(input);

      // One handle for the async function
      const handles = output.match(/const (_h\d*) = __flowTracer\.enterAsync/g);
      expect(handles).toBeTruthy();
      expect(handles!.length).toBe(1);

      const handleMatch = output.match(/const (_h\d*) = __flowTracer\.enterAsync/);
      const handleName = handleMatch![1];

      // Same handle used in exitAsync
      expect(output).toContain(`__flowTracer.exitAsync(${handleName})`);
    });

    it("should handle Promise.all with multiple async operations", () => {
      const input = `
        async function parallel() {
          const results = await Promise.all([
            fetch('url1'),
            fetch('url2'),
            fetch('url3')
          ]);
          return results;
        }
      `;
      const output = transform(input);

      const handles = output.match(/const (_h\d*) = __flowTracer\.enterAsync/g);
      expect(handles).toBeTruthy();
      expect(handles!.length).toBe(1);
    });

    it("should handle async generators", () => {
      const input = `
        async function* generateNumbers() {
          for (let i = 0; i < 10; i++) {
            await delay(100);
            yield i;
          }
        }
      `;
      const output = transform(input);

      const handles = output.match(/const (_h\d*) = __flowTracer\.enterAsync/g);
      expect(handles).toBeTruthy();
      expect(handles!.length).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("should handle IIFE (Immediately Invoked Function Expression)", () => {
      const input = `
        (function() {
          console.log("IIFE");
        })();
      `;
      const output = transform(input);

      const handles = output.match(/const (_h\d*) = __flowTracer\.enter/g);
      expect(handles).toBeTruthy();
      expect(handles!.length).toBe(1);
    });

    it("should handle function as callback", () => {
      const input = `
        setTimeout(function callback() {
          console.log("timeout");
        }, 1000);
      `;
      const output = transform(input);

      const handles = output.match(/const (_h\d*) = __flowTracer\.enter/g);
      expect(handles).toBeTruthy();
      expect(handles!.length).toBe(1);
    });

    it("should handle generator functions", () => {
      const input = `
        function* numbers() {
          yield 1;
          yield 2;
          yield 3;
        }
      `;
      const output = transform(input);

      const handles = output.match(/const (_h\d*) = __flowTracer\.enter/g);
      expect(handles).toBeTruthy();
      expect(handles!.length).toBe(1);
    });

    it("should avoid collision with handle in parameter name", () => {
      const input = `
        function process(h0) {
          return h0 * 2;
        }
      `;
      const output = transform(input);

      const handleMatch = output.match(/const (_h\d*) = __flowTracer\.enter/);
      expect(handleMatch).toBeTruthy();
      const generatedHandle = handleMatch![1];

      // Should generate different handle to avoid parameter collision
      expect(generatedHandle).not.toBe("h0");
    });

    it("should handle handles in destructuring parameters", () => {
      const input = `
        function process({ h0, h1 }) {
          return h0 + h1;
        }
      `;
      const output = transform(input);

      const handleMatch = output.match(/const (_h\d*) = __flowTracer\.enter/);
      expect(handleMatch).toBeTruthy();
      const generatedHandle = handleMatch![1];

      expect(["h0", "h1"]).not.toContain(generatedHandle);
    });
  });
});
