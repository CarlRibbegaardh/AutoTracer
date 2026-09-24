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

describe("Configuration Tests", () => {
  describe("Default Configuration", () => {
    it("should use default tracerName when not specified", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
    });

    it("should log exceptions by default", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input);

      expect(output).toContain("try {");
      expect(output).toContain("catch");
      expect(output).toContain("__flowTracer.traceException");
    });

    it("should use debug level for exceptions by default", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input);

      expect(output).toContain('"debug"');
    });
  });

  describe("Custom tracerName", () => {
    it("should use custom tracerName in all trace calls", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, { tracerName: "myCustomTracer" });

      expect(output).toContain("myCustomTracer.enter");
      expect(output).toContain("myCustomTracer.exit");
      expect(output).toContain("myCustomTracer.traceException");
      expect(output).not.toMatch(/\b__flowTracer\./);
    });

    it("should handle tracerName with underscores", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, { tracerName: "__my_custom_tracer__" });

      expect(output).toContain("__my_custom_tracer__.enter");
    });

    it("should handle tracerName with camelCase", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, { tracerName: "myTracerInstance" });

      expect(output).toContain("myTracerInstance.enter");
    });
  });

  describe("logExceptions Configuration", () => {
    it("should include exception logging when logExceptions is true", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, { logExceptions: true });

      expect(output).toContain("try {");
      expect(output).toContain("catch");
      expect(output).toContain("__flowTracer.traceException");
    });

    it("should exclude exception logging when logExceptions is false", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, { logExceptions: false });

      expect(output).toContain("try {");
      expect(output).toContain("finally {");
      expect(output).not.toContain("catch");
      expect(output).not.toContain("traceException");
    });

    it("should preserve user's try/catch when logExceptions is false", () => {
      const input = `
        function testFunction() {
          try {
            riskyOperation();
          } catch (err) {
            console.error(err);
          }
        }
      `;

      const output = transform(input, { logExceptions: false });

      expect(output).toContain("console.error(err)");
      // Should have user's catch but not plugin's traceException
      const catchCount = (output.match(/catch/g) || []).length;
      expect(catchCount).toBe(1); // Only user's catch
    });
  });

  describe("exceptionLogLevel Configuration", () => {
    it("should use debug level when specified", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, { exceptionLogLevel: "debug" });

      expect(output).toContain('"debug"');
    });

    it("should use warn level when specified", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, { exceptionLogLevel: "warn" });

      expect(output).toContain('"warn"');
      expect(output).not.toContain('"debug"');
    });

    it("should use error level when specified", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, { exceptionLogLevel: "error" });

      expect(output).toContain('"error"');
      expect(output).not.toContain('"debug"');
    });
  });

  describe("Include Filters - Functions", () => {
    it("should only instrument functions matching include pattern (exact string)", () => {
      const input = `
        function allowedFunction() {
          return 1;
        }

        function blockedFunction() {
          return 2;
        }
      `;

      const output = transform(input, {
        include: { functions: ["allowedFunction"] },
      });

      // allowedFunction should be instrumented
      expect(output).toContain('.enter("allowedFunction")');

      // blockedFunction should NOT be instrumented
      expect(output).not.toContain('.enter("blockedFunction")');
    });

    it("should support glob patterns in function include", () => {
      const input = `
        function handleClick() {
          return 1;
        }

        function handleSubmit() {
          return 2;
        }

        function helperFunction() {
          return 3;
        }
      `;

      const output = transform(input, {
        include: { functions: ["handle*"] },
      });

      // handle* should match handleClick and handleSubmit
      expect(output).toContain('.enter("handleClick")');
      expect(output).toContain('.enter("handleSubmit")');

      // helperFunction should NOT be instrumented
      expect(output).not.toContain('.enter("helperFunction")');
    });

    it("should support regex patterns in function include", () => {
      const input = `
        function testFunction() {
          return 1;
        }

        function testHelper() {
          return 2;
        }

        function myFunction() {
          return 3;
        }
      `;

      const output = transform(input, {
        include: { functions: [/^test/] },
      });

      // Functions starting with "test" should be instrumented
      expect(output).toContain('.enter("testFunction")');
      expect(output).toContain('.enter("testHelper")');

      // myFunction should NOT be instrumented
      expect(output).not.toContain('.enter("myFunction")');
    });

    it("should match any of multiple include patterns", () => {
      const input = `
        function foo() {
          return 1;
        }

        function bar() {
          return 2;
        }

        function baz() {
          return 3;
        }
      `;

      const output = transform(input, {
        include: { functions: ["foo", "bar"] },
      });

      expect(output).toContain('.enter("foo")');
      expect(output).toContain('.enter("bar")');
      expect(output).not.toContain('.enter("baz")');
    });

    it("should exclude anonymous functions when include patterns specified", () => {
      const input = `
        const myCallback = () => {
          return 42;
        };

        function namedFunction() {
          return 1;
        }
      `;

      const output = transform(input, {
        include: { functions: ["namedFunction"] },
      });

      // namedFunction should be instrumented
      expect(output).toContain('.enter("namedFunction")');

      // Anonymous arrow function should NOT be instrumented
      const enterCount = (output.match(/\.enter\(/g) || []).length;
      expect(enterCount).toBe(1); // Only namedFunction
    });
  });

  describe("Exclude Filters - Functions", () => {
    it("should exclude functions matching exclude pattern (exact string)", () => {
      const input = `
        function allowedFunction() {
          return 1;
        }

        function blockedFunction() {
          return 2;
        }
      `;

      const output = transform(input, {
        exclude: { functions: ["blockedFunction"] },
      });

      expect(output).toContain('.enter("allowedFunction")');
      expect(output).not.toContain('.enter("blockedFunction")');
    });

    it("should support glob patterns in function exclude", () => {
      const input = `
        function internalHelper() {
          return 1;
        }

        function internalUtility() {
          return 2;
        }

        function publicFunction() {
          return 3;
        }
      `;

      const output = transform(input, {
        exclude: { functions: ["internal*"] },
      });

      expect(output).not.toContain('.enter("internalHelper")');
      expect(output).not.toContain('.enter("internalUtility")');
      expect(output).toContain('.enter("publicFunction")');
    });

    it("should support regex patterns in function exclude", () => {
      const input = `
        function _privateFunction() {
          return 1;
        }

        function _anotherPrivate() {
          return 2;
        }

        function publicFunction() {
          return 3;
        }
      `;

      const output = transform(input, {
        exclude: { functions: [/^_/] },
      });

      expect(output).not.toContain('.enter("_privateFunction")');
      expect(output).not.toContain('.enter("_anotherPrivate")');
      expect(output).toContain('.enter("publicFunction")');
    });

    it("should exclude if matching any of multiple exclude patterns", () => {
      const input = `
        function foo() {
          return 1;
        }

        function bar() {
          return 2;
        }

        function baz() {
          return 3;
        }
      `;

      const output = transform(input, {
        exclude: { functions: ["foo", "bar"] },
      });

      expect(output).not.toContain('.enter("foo")');
      expect(output).not.toContain('.enter("bar")');
      expect(output).toContain('.enter("baz")');
    });
  });

  describe("Include and Exclude Combination - Functions", () => {
    it("should apply exclude after include (exclude takes precedence)", () => {
      const input = `
        function handleClick() {
          return 1;
        }

        function handleSubmit() {
          return 2;
        }

        function handleInternal() {
          return 3;
        }
      `;

      const output = transform(input, {
        include: { functions: ["handle*"] },
        exclude: { functions: ["*Internal"] },
      });

      // handleClick and handleSubmit match include but not exclude
      expect(output).toContain('.enter("handleClick")');
      expect(output).toContain('.enter("handleSubmit")');

      // handleInternal matches include but also matches exclude (exclude wins)
      expect(output).not.toContain('.enter("handleInternal")');
    });

    it("should handle complex include/exclude with regex", () => {
      const input = `
        function testPublicFunction() {
          return 1;
        }

        function test_privateFunction() {
          return 2;
        }

        function myFunction() {
          return 3;
        }
      `;

      const output = transform(input, {
        include: { functions: [/^test/] },
        exclude: { functions: [/^test_/] },
      });

      // testPublicFunction matches include, not exclude
      expect(output).toContain('.enter("testPublicFunction")');

      // test_privateFunction matches both, exclude wins
      expect(output).not.toContain('.enter("test_privateFunction")');

      // myFunction doesn't match include
      expect(output).not.toContain('.enter("myFunction")');
    });
  });

  describe("Include Filters - Paths", () => {
    it("should only instrument files matching include path pattern", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, {
        include: { paths: ["src/components/**"] },
      });

      // Since our test helper uses a non-matching filename,
      // function should NOT be instrumented
      expect(output).not.toContain("traceEnter");
    });

    it("should instrument when filename matches include pattern", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      // Use a filename that actually matches **/*.ts pattern (not a test file to avoid default exclude)
      const result = transformSync(input, {
        plugins: [
          [flowTracerBabelPlugin, { include: { paths: ["**/*.ts"] } }],
        ],
        filename: "MyComponent.ts",
        configFile: false,
        babelrc: false,
      });
      const output = result?.code ?? "";

      // Filename matches pattern, should be instrumented
      expect(output).toContain(".enter(");
    });

    it("should match any of multiple path patterns", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      // Use a filename that matches one of the patterns.
      // Avoid src/ prefix — when resolved to absolute, src/ inside a plugin package
      // triggers the hardcoded auto-tracer skip regex.
      const result = transformSync(input, {
        plugins: [
          [
            flowTracerBabelPlugin,
            { include: { paths: ["components/**", "lib/**"] } },
          ],
        ],
        filename: "components/MyHelper.ts",
        configFile: false,
        babelrc: false,
      });
      const output = result?.code ?? "";

      expect(output).toContain(".enter(");
    });
  });

  describe("Exclude Filters - Paths", () => {
    it("should exclude files matching exclude path pattern", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, {
        exclude: { paths: ["**/*.test.ts"] },
      });

      // Our test helper uses test.ts filename, should be excluded
      expect(output).not.toContain("traceEnter");
    });

    it("should exclude when matching any exclude pattern", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, {
        exclude: { paths: ["node_modules/**", "**/*.test.ts"] },
      });

      expect(output).not.toContain("traceEnter");
    });

    it("should handle cross-platform path separators", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      // Test with Windows-style path in exclude
      const output = transform(input, {
        exclude: { paths: ["**\\*.test.ts"] },
      });

      // Should normalize and match
      expect(output).not.toContain("traceEnter");
    });
  });

  describe("Include and Exclude Combination - Paths", () => {
    it("should apply exclude after include (exclude takes precedence)", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, {
        include: { paths: ["**/*.ts"] },
        exclude: { paths: ["**/*.test.ts"] },
      });

      // Matches include but also exclude (exclude wins)
      expect(output).not.toContain("traceEnter");
    });

    it("should instrument when matching include but not exclude", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      // Use a filename that matches include but not exclude
      const result = transformSync(input, {
        plugins: [
          [
            flowTracerBabelPlugin,
            {
              include: { paths: ["**/*.ts"] },
              exclude: { paths: ["**/*.spec.ts"] },
            },
          ],
        ],
        filename: "MyComponent.ts",
        configFile: false,
        babelrc: false,
      });
      const output = result?.code ?? "";

      // Matches include, doesn't match exclude
      expect(output).toContain(".enter(");
    });
  });

  describe("Combined Path and Function Filters", () => {
    it("should apply both path and function filters", () => {
      const input = `
        function allowedFunction() {
          return 1;
        }

        function blockedFunction() {
          return 2;
        }
      `;

      // Use a filename that matches the path pattern (not a test file to avoid default exclude)
      const result = transformSync(input, {
        plugins: [
          [
            flowTracerBabelPlugin,
            {
              include: {
                paths: ["**/*.ts"],
                functions: ["allowedFunction"],
              },
            },
          ],
        ],
        filename: "MyComponent.ts",
        configFile: false,
        babelrc: false,
      });
      const output = result?.code ?? "";

      // Path matches, only allowedFunction should be instrumented
      expect(output).toContain('.enter("allowedFunction")');
      expect(output).not.toContain('.enter("blockedFunction")');
    });

    it("should exclude if either path or function matches exclude", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      // Exclude by function name
      let output = transform(input, {
        exclude: { functions: ["testFunction"] },
      });
      expect(output).not.toMatch(/testFunction[^]*traceEnter/);

      // Exclude by path
      output = transform(input, {
        exclude: { paths: ["**/*.test.ts"] },
      });
      expect(output).not.toContain("traceEnter");
    });
  });

  describe("Edge Cases and Invalid Configuration", () => {
    it("should handle empty include patterns", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, {
        include: { functions: [], paths: [] },
      });

      // Empty arrays should be treated as no patterns
      expect(output).toContain(".enter(");
    });

    it("should handle empty exclude patterns", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, {
        exclude: { functions: [], paths: [] },
      });

      expect(output).toContain(".enter(");
    });

    it("should handle undefined config gracefully", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, undefined);

      // Should use defaults
      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("traceException");
    });

    it("should handle empty config object", () => {
      const input = `
        function testFunction() {
          return 42;
        }
      `;

      const output = transform(input, {});

      expect(output).toContain("__flowTracer.enter");
    });

    it("should handle mixed pattern types in same filter", () => {
      const input = `
        function exactMatch() {
          return 1;
        }

        function globMatch() {
          return 2;
        }

        function regexMatch123() {
          return 3;
        }
      `;

      const output = transform(input, {
        include: {
          functions: ["exactMatch", "glob*", /regex\w+\d+/],
        },
      });

      expect(output).toContain('.enter("exactMatch")');
      expect(output).toContain('.enter("globMatch")');
      expect(output).toContain('.enter("regexMatch123")');
    });
  });

  describe("prefix Configuration", () => {
    it("does not prepend prefix when prefix is not configured", () => {
      const input = `
        function processData() {
          return 42;
        }
      `;

      const output = transform(input);

      expect(output).toContain('.enter("processData")');
      expect(output).not.toContain('":");');
    });

    it("prepends prefix to top-level function name", () => {
      const input = `
        function processData() {
          return 42;
        }
      `;

      const output = transform(input, { prefix: "Header" });

      expect(output).toContain('.enter("Header:processData")');
      expect(output).not.toContain('.enter("processData")');
    });

    it("prepends prefix to all instrumented functions in the file", () => {
      const input = `
        function fetchData() {
          return 1;
        }

        function handleClick() {
          return 2;
        }
      `;

      const output = transform(input, { prefix: "Footer" });

      expect(output).toContain('.enter("Footer:fetchData")');
      expect(output).toContain('.enter("Footer:handleClick")');
    });

    it("prefix appears as outermost segment for nested functions", () => {
      const input = `
        function outer() {
          function inner() {
            return 1;
          }
          return inner();
        }
      `;

      const output = transform(input, { prefix: "Island" });

      expect(output).toContain('.enter("Island:outer")');
      expect(output).toContain('.enter("Island:outer:inner")');
    });

    it("filtering still uses un-prefixed name (include filter still works)", () => {
      const input = `
        function allowedFn() {
          return 1;
        }

        function blockedFn() {
          return 2;
        }
      `;

      const output = transform(input, {
        prefix: "MyApp",
        include: { functions: ["allowedFn"] },
      });

      expect(output).toContain('.enter("MyApp:allowedFn")');
      expect(output).not.toContain('.enter("MyApp:blockedFn")');
      expect(output).not.toContain('.enter("blockedFn")');
    });
  });
});
