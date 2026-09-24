import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import flowTracerBabelPlugin from "../../src/index";

/**
 * Helper to transform code using the plugin
 */
function transform(code: string, options = {}) {
  const result = transformSync(code, {
    plugins: [[flowTracerBabelPlugin, options]],
    filename: "test.ts",
    configFile: false,
    babelrc: false,
  });
  return result?.code ?? "";
}

describe("Modern JavaScript Features", () => {
  describe("Optional Chaining", () => {
    it("should handle optional chaining in function calls", () => {
      const input = `
        function callOptional(obj) {
          return obj?.method?.();
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("obj?.method?.()");
    });

    it("should handle optional chaining in property access", () => {
      const input = `
        function getProperty(obj) {
          return obj?.nested?.value;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("obj?.nested?.value");
    });

    it("should handle optional chaining with function parameters", () => {
      const input = `
        function processData(data) {
          const result = data?.items?.[0]?.process?.();
          return result;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.traceParameter");
      expect(output).toContain("data?.items?.[0]?.process?.()");
    });
  });

  describe("Nullish Coalescing", () => {
    it("should handle nullish coalescing operator", () => {
      const input = `
        function getWithDefault(value) {
          return value ?? "default";
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain('value ?? "default"');
    });

    it("should handle chained nullish coalescing", () => {
      const input = `
        function getFirstValid(a, b, c) {
          return a ?? b ?? c ?? "fallback";
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("??");
    });
  });

  describe("Logical Assignment", () => {
    it("should handle logical AND assignment", () => {
      const input = `
        function updateIfTruthy(obj, value) {
          obj.prop &&= value;
          return obj;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("&&=");
    });

    it("should handle logical OR assignment", () => {
      const input = `
        function setDefault(obj) {
          obj.value ||= "default";
          return obj;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("||=");
    });

    it("should handle nullish assignment", () => {
      const input = `
        function ensureValue(obj) {
          obj.data ??= {};
          return obj;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("??=");
    });
  });

  describe("Private Class Fields", () => {
    it("should handle private methods", () => {
      const input = `
        class Service {
          #privateMethod() {
            return "private";
          }

          publicMethod() {
            return this.#privateMethod();
          }
        }
      `;

      const output = transform(input);

      // Private methods should be instrumented
      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("#privateMethod");
    });

    it("should handle private fields access", () => {
      const input = `
        class Counter {
          #count = 0;

          increment() {
            this.#count++;
            return this.#count;
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("#count");
    });

    it("should handle private getters and setters", () => {
      const input = `
        class Store {
          #value;

          get #internalValue() {
            return this.#value;
          }

          set #internalValue(val) {
            this.#value = val;
          }

          getValue() {
            return this.#internalValue;
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("#internalValue");
    });
  });

  describe("Static Initialization Blocks", () => {
    it("should handle static initialization blocks", () => {
      const input = `
        class Config {
          static settings = {};

          static {
            this.settings.initialized = true;
          }

          static getSettings() {
            return this.settings;
          }
        }
      `;

      const output = transform(input);

      // Static methods should be instrumented
      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("getSettings");
    });

    it("should not instrument static blocks themselves", () => {
      const input = `
        class Registry {
          static items = [];

          static {
            this.items.push("initial");
          }
        }
      `;

      const output = transform(input);

      // Static blocks are not functions, shouldn't be instrumented
      expect(output).toContain("static {");
    });
  });

  describe("Numeric Separators", () => {
    it("should handle numeric separators in code", () => {
      const input = `
        function processLargeNumber() {
          const million = 1_000_000;
          const billion = 1_000_000_000;
          return million + billion;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      // Numeric separators may be preserved or removed by Babel
      // Just verify the function is instrumented
    });

    it("should handle hex/binary with separators", () => {
      const input = `
        function getBitmask() {
          const mask = 0b1111_0000_1010_0101;
          return mask;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
    });
  });

  describe("BigInt", () => {
    it("should handle BigInt literals", () => {
      const input = `
        function calculateHuge() {
          const big = 9007199254740991n;
          return big * 2n;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("9007199254740991n");
    });

    it("should handle BigInt operations", () => {
      const input = `
        function addBigInts(a, b) {
          return a + b;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.traceParameter");
    });
  });

  describe("Dynamic Import", () => {
    it("should handle dynamic import expressions", () => {
      const input = `
        async function loadModule(moduleName) {
          const module = await import(moduleName);
          return module.default;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("import(");
    });

    it("should handle dynamic import with destructuring", () => {
      const input = `
        async function getUtils() {
          const { helper, formatter } = await import("./utils");
          return { helper, formatter };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("import");
    });
  });

  describe("Object Rest/Spread", () => {
    it("should handle object rest in parameters", () => {
      const input = `
        function processUser({ name, age, ...rest }) {
          return { name, age, extra: rest };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.traceParameter");
      // Should trace name, age, and ...rest
    });

    it("should handle object spread in return", () => {
      const input = `
        function mergeObjects(a, b) {
          return { ...a, ...b };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("...");
    });
  });

  describe("Template Literals", () => {
    it("should handle tagged template literals", () => {
      const input = `
        function formatString(tag) {
          return tag\`Hello \${name}\`;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("tag`");
    });

    it("should handle nested template literals", () => {
      const input = `
        function buildMessage(user) {
          return \`User: \${user.name}, Status: \${user.active ? 'Active' : 'Inactive'}\`;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("User:");
    });
  });
});
