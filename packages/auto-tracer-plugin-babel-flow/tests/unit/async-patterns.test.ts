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

describe("Async Patterns", () => {
  describe("Promise Combinators", () => {
    it("should handle Promise.all", () => {
      const input = `
        async function processAll() {
          const results = await Promise.all([fetch1(), fetch2()]);
          return results;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.exit");
      expect(output).toContain("Promise.all");
    });

    it("should handle Promise.race", () => {
      const input = `
        async function raceRequests() {
          const winner = await Promise.race([slow(), fast()]);
          return winner;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("Promise.race");
    });

    it("should handle Promise.allSettled", () => {
      const input = `
        async function checkAll() {
          const results = await Promise.allSettled([task1(), task2()]);
          return results;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("Promise.allSettled");
    });

    it("should handle Promise.any", () => {
      const input = `
        async function firstSuccess() {
          const result = await Promise.any([attempt1(), attempt2()]);
          return result;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("Promise.any");
    });

    it("should handle nested Promise combinators", () => {
      const input = `
        async function complexFlow() {
          const data = await Promise.all([
            Promise.race([fetch1(), fetch2()]),
            Promise.allSettled([task1(), task2()])
          ]);
          return data;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("Promise.all");
      expect(output).toContain("Promise.race");
      expect(output).toContain("Promise.allSettled");
    });
  });

  describe("Await in Control Flow", () => {
    it("should handle await in if statement", () => {
      const input = `
        async function conditionalFetch() {
          if (await checkPermission()) {
            return await fetchData();
          }
          return null;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("await checkPermission()");
      expect(output).toContain("await fetchData()");
    });

    it("should handle await in for loop", () => {
      const input = `
        async function processItems(items) {
          for (const item of items) {
            await processItem(item);
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("await processItem");
    });

    it("should handle await in while loop", () => {
      const input = `
        async function pollUntilReady() {
          while (await checkStatus() !== 'ready') {
            await sleep(1000);
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("await checkStatus()");
      expect(output).toContain("await sleep");
    });

    it("should handle await in switch statement", () => {
      const input = `
        async function handleAction(action) {
          switch (await getActionType(action)) {
            case 'create':
              return await create();
            case 'update':
              return await update();
            default:
              return null;
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("await getActionType");
      expect(output).toContain("await create()");
      expect(output).toContain("await update()");
    });

    it("should handle await in ternary expression", () => {
      const input = `
        async function getValue(flag) {
          return flag ? await fetchA() : await fetchB();
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("await fetchA()");
      expect(output).toContain("await fetchB()");
    });

    it("should handle await in logical expressions", () => {
      const input = `
        async function checkAndFetch() {
          const result = await isValid() && await fetchData();
          return result;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("await isValid()");
      expect(output).toContain("await fetchData()");
    });
  });

  describe("Top-Level Await", () => {
    it("should handle top-level await in module", () => {
      const input = `
        const data = await fetchInitialData();

        export function useData() {
          return data;
        }
      `;

      const output = transform(input);

      // Top-level await is outside functions, so only useData should be instrumented
      expect(output).toContain("await fetchInitialData()");
      expect(output).toContain("__flowTracer.enter");
    });

    it("should not instrument top-level await itself", () => {
      const input = `
        const config = await loadConfig();
      `;

      const output = transform(input);

      // Top-level code shouldn't be wrapped
      expect(output).toContain("await loadConfig()");
      expect(output).not.toContain("__flowTracer.enter");
    });
  });

  describe("Try/Catch with Await", () => {
    it("should handle await in try block", () => {
      const input = `
        async function safeFetch() {
          try {
            const data = await fetchData();
            return data;
          } catch (e) {
            return null;
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("await fetchData()");
      expect(output).toContain("catch");
    });

    it("should handle await in catch block", () => {
      const input = `
        async function fetchWithFallback() {
          try {
            return await fetchPrimary();
          } catch (e) {
            return await fetchFallback();
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("await fetchPrimary()");
      expect(output).toContain("await fetchFallback()");
    });

    it("should handle await in finally block", () => {
      const input = `
        async function withCleanup() {
          try {
            return await doWork();
          } finally {
            await cleanup();
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("await doWork()");
      expect(output).toContain("await cleanup()");
      expect(output).toContain("finally");
    });

    it("should handle multiple awaits in nested try/catch", () => {
      const input = `
        async function complexErrorHandling() {
          try {
            const a = await step1();
            try {
              const b = await step2(a);
              return b;
            } catch (e) {
              return await fallback2();
            }
          } catch (e) {
            return await fallback1();
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("await step1()");
      expect(output).toContain("await step2");
      expect(output).toContain("await fallback1()");
      expect(output).toContain("await fallback2()");
    });
  });

  describe("Async Generators", () => {
    it("should handle async generator functions", () => {
      const input = `
        async function* generateData() {
          yield await fetch1();
          yield await fetch2();
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("yield");
      expect(output).toContain("await fetch1()");
    });

    it("should handle async generator with loops", () => {
      const input = `
        async function* streamItems(items) {
          for (const item of items) {
            const processed = await process(item);
            yield processed;
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("yield");
      expect(output).toContain("await process");
    });

    it("should handle async generator with yield*", () => {
      const input = `
        async function* delegateGenerator() {
          yield* await getAsyncIterable();
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("yield*");
      expect(output).toContain("await getAsyncIterable()");
    });
  });

  describe("Async Iterators", () => {
    it("should handle for-await-of loops", () => {
      const input = `
        async function consumeStream(stream) {
          for await (const chunk of stream) {
            await processChunk(chunk);
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("for await");
      expect(output).toContain("await processChunk");
    });

    it("should handle async iteration with break", () => {
      const input = `
        async function findInStream(stream, target) {
          for await (const item of stream) {
            if (item === target) {
              return item;
            }
          }
          return null;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("for await");
      expect(output).toContain("return");
    });
  });

  describe("Complex Async Error Handling", () => {
    it("should handle async function with multiple error paths", () => {
      const input = `
        async function complexFlow(input) {
          if (!input) {
            throw new Error('Invalid input');
          }

          try {
            const validated = await validate(input);
            const processed = await process(validated);
            return processed;
          } catch (e) {
            await logError(e);
            throw e;
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.traceException");
      expect(output).toContain("await validate");
      expect(output).toContain("await logError");
    });

    it("should handle Promise rejection handling", () => {
      const input = `
        async function handleRejection() {
          return await fetch().catch(err => handleError(err));
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("await fetch().catch");
    });

    it("should handle async IIFE", () => {
      const input = `
        const result = await (async () => {
          const data = await fetchData();
          return process(data);
        })();
      `;

      const output = transform(input);

      // IIFE should be instrumented
      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("await fetchData()");
    });
  });
});
