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

describe("Return Statement Instrumentation", () => {
  describe("explicit return statements", () => {
    it("should instrument return with primitive value", () => {
      const input = `
        function getValue() {
          return 42;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = 42/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
      expect(output).toMatch(/return _returnValue\d*/);
    });

    it("should instrument return with string literal", () => {
      const input = `
        function getMessage() {
          return "hello world";
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = "hello world"/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
      expect(output).toMatch(/return _returnValue\d*/);
    });

    it("should instrument return with boolean", () => {
      const input = `
        function check() {
          return true;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = true/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return with null", () => {
      const input = `
        function getNull() {
          return null;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = null/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return with variable", () => {
      const input = `
        function compute(x) {
          const result = x * 2;
          return result;
        }
      `;
      const output = transform(input);

      expect(output).toContain("const result = x * 2");
      expect(output).toMatch(/const _returnValue\d* = result/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
      expect(output).toMatch(/return _returnValue\d*;?/);
    });

    it("should instrument return with binary expression", () => {
      const input = `
        function add(a, b) {
          return a + b;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = a \+ b/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return with ternary expression", () => {
      const input = `
        function max(a, b) {
          return a > b ? a : b;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = a > b \? a : b/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return with object literal", () => {
      const input = `
        function createObj(name) {
          return { name: name, id: 1 };
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = {/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
      expect(output).toMatch(/return _returnValue\d*;?/);
    });

    it("should instrument return with array literal", () => {
      const input = `
        function getArray() {
          return [1, 2, 3];
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = \[1, 2, 3\]/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return with function call", () => {
      const input = `
        function wrapper() {
          return doSomething();
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = doSomething()/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return with member expression", () => {
      const input = `
        function getProp(obj) {
          return obj.property;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = obj.property/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return with method call", () => {
      const input = `
        function callMethod(obj) {
          return obj.method();
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = obj.method()/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return with await expression in async function", () => {
      const input = `
        async function fetchData(url) {
          return await fetch(url);
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = await fetch\(url\)/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
      expect(output).toContain("__flowTracer.enterAsync");
      expect(output).toContain("__flowTracer.exitAsync");
    });

    it("should instrument return with complex nested expression", () => {
      const input = `
        function complex(arr) {
          return arr.filter(x => x > 0).map(x => x * 2).reduce((a, b) => a + b, 0);
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* =/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });
  });

  describe("empty return statements", () => {
    it("should NOT instrument return without value", () => {
      const input = `
        function earlyExit(condition) {
          if (condition) {
            return;
          }
          doSomething();
        }
      `;
      const output = transform(input);

      // Empty return should remain as-is (no __returnValue)
      // The output should contain "return;" but not "__returnValue"
      expect(output).toMatch(/if\s*\(\s*condition\s*\)\s*{[\s\S]*return;/);
      // Count occurrences - should not have __returnValue for the empty return
      const returnValueCount = (output.match(/__returnValue/g) || []).length;
      expect(returnValueCount).toBe(0);
    });

    it("should handle function with only empty return", () => {
      const input = `
        function doNothing() {
          return;
        }
      `;
      const output = transform(input);

      // Should have tracing infrastructure but no return value logging
      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
      expect(output).not.toContain("__returnValue");
      expect(output).not.toContain("traceReturnValue");
    });

    it("should handle multiple empty returns in different branches", () => {
      const input = `
        function multipleEarlyExits(a, b) {
          if (a < 0) return;
          if (b < 0) return;
          doWork(a, b);
        }
      `;
      const output = transform(input);

      expect(output).not.toContain("__returnValue");
      expect(output).not.toContain("traceReturnValue");
    });
  });

  describe("implicit returns (no return statement)", () => {
    it("should handle function with no return statement", () => {
      const input = `
        function logMessage(msg) {
          console.log(msg);
        }
      `;
      const output = transform(input);

      // Should have enter/exit but no return value tracing
      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
      expect(output).not.toContain("__returnValue");
      expect(output).not.toContain("traceReturnValue");
    });

    it("should handle function that only has side effects", () => {
      const input = `
        function updateState(value) {
          state.value = value;
          state.timestamp = Date.now();
        }
      `;
      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
      expect(output).not.toContain("traceReturnValue");
    });

    it("should handle arrow function with expression body returning undefined", () => {
      const input = `
        const logIt = (x) => console.log(x);
      `;
      const output = transform(input);

      // Arrow with expression body is converted to block with return
      expect(output).toContain("__flowTracer.enter");
      expect(output).toMatch(/const _returnValue\d* = console\.log\(x\)/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle constructor with no return", () => {
      const input = `
        class MyClass {
          constructor(value) {
            this.value = value;
          }
        }
      `;
      const output = transform(input);

      // Constructor should be instrumented but no explicit return logging
      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
    });

    it("should handle setter with no return", () => {
      const input = `
        class MyClass {
          setValue(val) {
            this._value = val;
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).not.toContain("traceReturnValue");
    });
  });

  describe("multiple return statements", () => {
    it("should instrument all return statements in if/else", () => {
      const input = `
        function classify(value) {
          if (value > 0) {
            return "positive";
          } else if (value < 0) {
            return "negative";
          } else {
            return "zero";
          }
        }
      `;
      const output = transform(input);

      // Each return should be instrumented
      const returnValueCount = (output.match(/const _returnValue\d*/g) || []).length;
      expect(returnValueCount).toBe(3);
      const traceReturnCount = (output.match(/traceReturnValue/g) || []).length;
      expect(traceReturnCount).toBe(3);
    });

    it("should instrument returns in switch statement", () => {
      const input = `
        function handleCase(type) {
          switch (type) {
            case "A":
              return 1;
            case "B":
              return 2;
            default:
              return 0;
          }
        }
      `;
      const output = transform(input);

      const returnValueCount = (output.match(/const _returnValue\d*/g) || []).length;
      expect(returnValueCount).toBe(3);
    });

    it("should instrument early return and final return", () => {
      const input = `
        function validate(input) {
          if (!input) {
            return false;
          }
          const result = process(input);
          return result.isValid;
        }
      `;
      const output = transform(input);

      const returnValueCount = (output.match(/const _returnValue\d*/g) || []).length;
      expect(returnValueCount).toBe(2);
    });

    it("should handle mix of empty and value returns", () => {
      const input = `
        function maybeValue(condition, value) {
          if (!condition) {
            return;
          }
          return value;
        }
      `;
      const output = transform(input);

      // Only one __returnValue (for the value return)
      const returnValueCount = (output.match(/const _returnValue\d*/g) || []).length;
      expect(returnValueCount).toBe(1);
      const traceReturnCount = (output.match(/traceReturnValue/g) || []).length;
      expect(traceReturnCount).toBe(1);
    });
  });

  describe("return in nested blocks", () => {
    it("should instrument return inside try block", () => {
      const input = `
        function riskyOperation() {
          try {
            const result = dangerousCall();
            return result;
          } catch (error) {
            handleError(error);
          }
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = result/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return inside catch block", () => {
      const input = `
        function recoverFromError() {
          try {
            riskyOp();
          } catch (error) {
            return fallbackValue;
          }
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = fallbackValue/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return inside finally block", () => {
      const input = `
        function alwaysReturn() {
          try {
            doWork();
          } finally {
            return cleanup();
          }
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = cleanup()/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return inside loop", () => {
      const input = `
        function findFirst(arr, predicate) {
          for (const item of arr) {
            if (predicate(item)) {
              return item;
            }
          }
          return null;
        }
      `;
      const output = transform(input);

      const returnValueCount = (output.match(/const _returnValue\d*/g) || []).length;
      expect(returnValueCount).toBe(2);
    });

    it("should instrument return inside nested if statements", () => {
      const input = `
        function deepNesting(a, b, c) {
          if (a) {
            if (b) {
              if (c) {
                return "all true";
              }
              return "a and b";
            }
            return "only a";
          }
          return 4;
        }
      `;
      const output = transform(input);

      const returnValueCount = (output.match(/const _returnValue\d*/g) || []).length;
      expect(returnValueCount).toBe(4);
    });

    it("should instrument return inside labeled block", () => {
      const input = `
        function withLabel() {
          outer: {
            if (condition) {
              return "early";
            }
            break outer;
          }
          return result;
        }
      `;
      const output = transform(input);

      const returnValueCount = (output.match(/const _returnValue\d*/g) || []).length;
      expect(returnValueCount).toBe(2);
    });
  });

  describe("arrow function return patterns", () => {
    it("should convert arrow expression to instrumented block", () => {
      const input = `
        const double = (x) => x * 2;
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = x \* 2/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
      expect(output).toMatch(/return _returnValue\d*;?/);
    });

    it("should instrument arrow function with object literal body", () => {
      const input = `
        const makeObj = (name) => ({ name, id: 1 });
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* =/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument arrow function returning function call", () => {
      const input = `
        const caller = (fn) => fn();
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = fn()/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle arrow function with block body and return", () => {
      const input = `
        const process = (x) => {
          const result = x * 2;
          return result;
        };
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = result/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle arrow function with block body and no return", () => {
      const input = `
        const logValue = (x) => {
          console.log(x);
        };
      `;
      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).not.toContain("traceReturnValue");
    });

    it("should handle arrow function with conditional return", () => {
      const input = `
        const maybe = (x) => x > 0 ? x : 0;
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = x > 0 \? x : 0/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle nested arrow functions", () => {
      const input = `
        const outer = (x) => (y) => x + y;
      `;
      const output = transform(input);

      // Both levels should be instrumented
      expect(output).toContain("__flowTracer.enter");
      const returnValueCount = (output.match(/const _returnValue\d*/g) || []).length;
      expect(returnValueCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("async function returns", () => {
    it("should instrument return in async function", () => {
      const input = `
        async function getData() {
          return data;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = data/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
      expect(output).toContain("__flowTracer.enterAsync");
      expect(output).toContain("__flowTracer.exitAsync");
    });

    it("should instrument await in return", () => {
      const input = `
        async function fetchUser(id) {
          return await api.getUser(id);
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = await api\.getUser\(id\)/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle async arrow function with expression", () => {
      const input = `
        const fetchData = async (url) => await fetch(url);
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = await fetch\(url\)/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
      expect(output).toContain("__flowTracer.enterAsync");
    });

    it("should handle async function with multiple awaits", () => {
      const input = `
        async function complex() {
          const a = await step1();
          const b = await step2(a);
          return await step3(b);
        }
      `;
      const output = transform(input);

      expect(output).toContain("const a = await step1()");
      expect(output).toContain("const b = await step2(a)");
      expect(output).toMatch(/const _returnValue\d* = await step3\(b\)/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle async function with Promise creation", () => {
      const input = `
        async function delayedValue() {
          return new Promise(resolve => setTimeout(() => resolve(42), 100));
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = new Promise/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });
  });

  describe("edge cases", () => {
    it("should handle return of undefined explicitly", () => {
      const input = `
        function getUndefined() {
          return undefined;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = undefined/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle return of void expression", () => {
      const input = `
        function voidReturn() {
          return void 0;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = void 0/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle return with logical expressions", () => {
      const input = `
        function orReturn(a, b) {
          return a || b;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = a || b/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle return with nullish coalescing", () => {
      const input = `
        function nullishReturn(a, b) {
          return a ?? b;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = a \?\? b/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle return with optional chaining", () => {
      const input = `
        function chainReturn(obj) {
          return obj?.property?.value;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = obj\?\.property\?\.value/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle return with spread operator", () => {
      const input = `
        function spreadReturn(arr) {
          return [...arr];
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = \[\.\.\.arr\]/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle return with destructuring", () => {
      const input = `
        function destructReturn() {
          const { a, b } = obj;
          return { a, b };
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle return with new expression", () => {
      const input = `
        function createInstance() {
          return new MyClass();
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = new MyClass()/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle return with typeof", () => {
      const input = `
        function getType(value) {
          return typeof value;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = typeof value/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle return with template literal", () => {
      const input = `
        function greet(name) {
          return \`Hello, \${name}!\`;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* =/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle return with tagged template literal", () => {
      const input = `
        function tagged(name) {
          return html\`<div>\${name}</div>\`;
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* =/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle generator function yield (not return)", () => {
      const input = `
        function* generator() {
          yield 1;
          yield 2;
          return 3;
        }
      `;
      const output = transform(input);

      // Should instrument the return but not yields
      expect(output).toMatch(/const _returnValue\d* = 3/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
      // Yields should remain unchanged
      expect(output).toContain("yield 1");
      expect(output).toContain("yield 2");
    });
  });

  describe("class method returns", () => {
    it("should instrument return in class method", () => {
      const input = `
        class Calculator {
          add(a, b) {
            return a + b;
          }
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = a \+ b/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return in static method", () => {
      const input = `
        class Utils {
          static identity(x) {
            return x;
          }
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = x/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should instrument return in getter", () => {
      const input = `
        class Person {
          get fullName() {
            return this.firstName + " " + this.lastName;
          }
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* =/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
    });

    it("should handle async class method", () => {
      const input = `
        class ApiClient {
          async fetch(url) {
            return await fetchData(url);
          }
        }
      `;
      const output = transform(input);

      expect(output).toMatch(/const _returnValue\d* = await fetchData\(url\)/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
      expect(output).toContain("__flowTracer.enterAsync");
    });
  });

  describe("configuration impact on return tracing", () => {
    it("should respect custom tracer name for return value logging", () => {
      const input = `
        function test() {
          return 42;
        }
      `;
      const output = transform(input, { tracerName: "customTracer" });

      expect(output).toMatch(/customTracer\.traceReturnValue\(_returnValue\d*\)/);
      expect(output).not.toContain("__flowTracer.traceReturnValue");
    });

    it("should include return tracing even when exceptions disabled", () => {
      const input = `
        function test() {
          return 42;
        }
      `;
      const output = transform(input, { logExceptions: false });

      // Return tracing should still work
      expect(output).toMatch(/const _returnValue\d* = 42/);
      expect(output).toMatch(/__flowTracer\.traceReturnValue\(_returnValue\d*\)/);
      // But no catch block
      expect(output).not.toContain("catch (e)");
    });
  });
});


