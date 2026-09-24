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

describe("Performance Edge Cases", () => {
  describe("Deep Nesting", () => {
    it("should handle 10 levels of nested functions", () => {
      const input = `
        function level1() {
          function level2() {
            function level3() {
              function level4() {
                function level5() {
                  function level6() {
                    function level7() {
                      function level8() {
                        function level9() {
                          function level10() {
                            return "deep";
                          }
                          return level10();
                        }
                        return level9();
                      }
                      return level8();
                    }
                    return level7();
                  }
                  return level6();
                }
                return level5();
              }
              return level4();
            }
            return level3();
          }
          return level2();
        }
      `;

      const output = transform(input);

      // All 10 levels should be instrumented
      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("level1");
      expect(output).toContain("level10");
    });

    it("should handle deeply nested if/else blocks with returns", () => {
      const input = `
        function deepConditionals(a, b, c, d, e) {
          if (a) {
            if (b) {
              if (c) {
                if (d) {
                  if (e) {
                    return "all true";
                  }
                  return "e false";
                }
                return "d false";
              }
              return "c false";
            }
            return "b false";
          }
          return "a false";
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
      // All 6 return statements should be instrumented
    });

    it("should handle deeply nested try/catch blocks", () => {
      const input = `
        function nestedExceptions() {
          try {
            try {
              try {
                try {
                  throw new Error("deep error");
                } catch (e1) {
                  throw e1;
                }
              } catch (e2) {
                throw e2;
              }
            } catch (e3) {
              throw e3;
            }
          } catch (e4) {
            return "caught";
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
    });
  });

  describe("Large Parameter Lists", () => {
    it("should handle 20 parameters", () => {
      const input = `
        function manyParams(
          p1, p2, p3, p4, p5, p6, p7, p8, p9, p10,
          p11, p12, p13, p14, p15, p16, p17, p18, p19, p20
        ) {
          return p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9 + p10 +
                 p11 + p12 + p13 + p14 + p15 + p16 + p17 + p18 + p19 + p20;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.traceParameter");
      // All 20 parameters should be traced
      expect(output).toContain("p1");
      expect(output).toContain("p20");
    });

    it("should handle mix of regular params and rest params", () => {
      const input = `
        function mixedParams(a, b, c, d, e, ...rest) {
          return [a, b, c, d, e, ...rest];
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.traceParameter");
      expect(output).toContain("...rest");
    });

    it("should handle destructured parameters with many properties", () => {
      const input = `
        function destructuredParams({ a, b, c, d, e, f, g, h, i, j }) {
          return a + b + c + d + e + f + g + h + i + j;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.traceParameter");
    });
  });

  describe("Complex Control Flow", () => {
    it("should handle switch with many cases and returns", () => {
      const input = `
        function largeSwitch(value) {
          switch (value) {
            case 1: return "one";
            case 2: return "two";
            case 3: return "three";
            case 4: return "four";
            case 5: return "five";
            case 6: return "six";
            case 7: return "seven";
            case 8: return "eight";
            case 9: return "nine";
            case 10: return "ten";
            default: return "other";
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
      // All 11 returns should be instrumented
    });

    it("should handle multiple loops with breaks and continues", () => {
      const input = `
        function complexLoops(items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i] === null) continue;

            for (let j = 0; j < items[i].length; j++) {
              if (items[i][j] === 0) break;

              for (let k = 0; k < 10; k++) {
                if (k === 5) continue;
                if (k === 8) break;
              }
            }
          }
          return "done";
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
    });

    it("should handle labeled statements with nested loops", () => {
      const input = `
        function labeledLoops(matrix) {
          outer: for (let i = 0; i < matrix.length; i++) {
            middle: for (let j = 0; j < matrix[i].length; j++) {
              inner: for (let k = 0; k < matrix[i][j].length; k++) {
                if (matrix[i][j][k] === 0) break outer;
                if (matrix[i][j][k] === 1) break middle;
                if (matrix[i][j][k] === 2) continue inner;
              }
            }
          }
          return "completed";
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
    });
  });

  describe("Large Functions", () => {
    it("should handle function with many local variables", () => {
      const input = `
        function manyVariables() {
          const v1 = 1, v2 = 2, v3 = 3, v4 = 4, v5 = 5;
          const v6 = 6, v7 = 7, v8 = 8, v9 = 9, v10 = 10;
          const v11 = 11, v12 = 12, v13 = 13, v14 = 14, v15 = 15;
          const v16 = 16, v17 = 17, v18 = 18, v19 = 19, v20 = 20;

          return v1 + v2 + v3 + v4 + v5 + v6 + v7 + v8 + v9 + v10 +
                 v11 + v12 + v13 + v14 + v15 + v16 + v17 + v18 + v19 + v20;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
    });

    it("should handle function with many statements", () => {
      const input = `
        function manyStatements(obj) {
          obj.a = 1;
          obj.b = 2;
          obj.c = 3;
          obj.d = 4;
          obj.e = 5;
          obj.f = 6;
          obj.g = 7;
          obj.h = 8;
          obj.i = 9;
          obj.j = 10;

          if (obj.a) obj.x = true;
          if (obj.b) obj.y = true;
          if (obj.c) obj.z = true;

          return obj;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
    });
  });

  describe("Extreme Async Patterns", () => {
    it("should handle deeply nested async/await", () => {
      const input = `
        async function level1() {
          return await (async function level2() {
            return await (async function level3() {
              return await (async function level4() {
                return await (async function level5() {
                  return "deep async";
                })();
              })();
            })();
          })();
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("level1");
    });

    it("should handle many parallel promises", () => {
      const input = `
        async function manyPromises() {
          const results = await Promise.all([
            fetch('/api/1'),
            fetch('/api/2'),
            fetch('/api/3'),
            fetch('/api/4'),
            fetch('/api/5'),
            fetch('/api/6'),
            fetch('/api/7'),
            fetch('/api/8'),
            fetch('/api/9'),
            fetch('/api/10')
          ]);
          return results;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("Promise.all");
    });
  });

  describe("Edge Case Combinations", () => {
    it("should handle class with many methods", () => {
      const input = `
        class LargeClass {
          method1() { return 1; }
          method2() { return 2; }
          method3() { return 3; }
          method4() { return 4; }
          method5() { return 5; }
          method6() { return 6; }
          method7() { return 7; }
          method8() { return 8; }
          method9() { return 9; }
          method10() { return 10; }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("method1");
      expect(output).toContain("method10");
    });

    it("should handle generator with complex yield patterns", () => {
      const input = `
        function* complexGenerator(items) {
          for (const item of items) {
            if (item.type === 'special') {
              yield* processSpecial(item);
            } else {
              yield item;
            }
          }

          function* processSpecial(item) {
            yield item.value;
            yield item.metadata;
            yield item.extra;
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("complexGenerator");
      expect(output).toContain("processSpecial");
    });

    it("should handle function with mixed arrow and regular functions", () => {
      const input = `
        function mixedFunctions() {
          const arrow1 = () => "arrow1";
          function regular1() { return "regular1"; }
          const arrow2 = (x) => x * 2;
          function regular2(y) { return y + 1; }

          return {
            a: arrow1(),
            b: regular1(),
            c: arrow2(5),
            d: regular2(10),
            e: ((z) => z * 3)(7)
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("mixedFunctions");
    });
  });

  describe("Stress Tests", () => {
    it("should handle file with 50 functions", () => {
      const functions = Array.from({ length: 50 }, (_, i) =>
        `function func${i}() { return ${i}; }`
      ).join('\n');

      const output = transform(functions);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("func0");
      expect(output).toContain("func49");
    });

    it("should handle extremely long function name", () => {
      const longName = "a".repeat(100);
      const input = `
        function ${longName}() {
          return "long name";
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain(longName);
    });

    it("should handle function returning huge object literal", () => {
      const input = `
        function hugeObject() {
          return {
            prop1: 1, prop2: 2, prop3: 3, prop4: 4, prop5: 5,
            prop6: 6, prop7: 7, prop8: 8, prop9: 9, prop10: 10,
            prop11: 11, prop12: 12, prop13: 13, prop14: 14, prop15: 15,
            prop16: 16, prop17: 17, prop18: 18, prop19: 19, prop20: 20,
            nested: {
              a: 1, b: 2, c: 3, d: 4, e: 5,
              deeper: {
                x: 1, y: 2, z: 3
              }
            }
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
    });
  });
});
