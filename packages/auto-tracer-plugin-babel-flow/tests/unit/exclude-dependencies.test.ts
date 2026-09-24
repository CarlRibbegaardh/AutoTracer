import { describe, it, expect } from "vitest";
import * as babel from "@babel/core";
import flowTracerBabelPlugin from "../../src/index";

/**
 * Tests to ensure the Babel plugin does NOT instrument its own dependencies.
 *
 * This is critical to avoid circular instrumentation where:
 * 1. FlowTracer code gets instrumented
 * 2. Instrumented code tries to call __flowTracer.enter()
 * 3. But __flowTracer doesn't exist yet because we're in the middle of creating it
 *
 * Result: ReferenceError: __flowTracer is not defined
 */
describe("Dependency Exclusion", () => {
  it("should NOT instrument @autotracer/flow package code", () => {
    const input = `
      /**
       * Creates a function flow tracer instance.
       */
      export function createFlowTracer(logger, config) {
        const mergedConfig = {
          ...DEFAULT_CONFIG,
          ...config
        };
        return { enter, exit };
      }
    `;

    const result = babel.transformSync(input, {
      filename: "/packages/auto-tracer-flow/dist/lib/FlowTracer.js",
      plugins: [[flowTracerBabelPlugin, { tracerName: "__flowTracer" }]],
      configFile: false,
      babelrc: false,
    });

    // Should NOT have instrumentation
    expect(result?.code).not.toContain("__flowTracer.enter");
    expect(result?.code).not.toContain("__flowTracer.exit");

    // Should be unchanged
    expect(result?.code).toContain("createFlowTracer");
  });

  it("should NOT instrument @autotracer/logger package code", () => {
    const input = `
      export function getLogger(name) {
        return loggers.get(name) || createLogger(name);
      }
    `;

    const result = babel.transformSync(input, {
      filename: "/packages/auto-tracer-logger/dist/lib/registry/getLogger.js",
      plugins: [[flowTracerBabelPlugin, { tracerName: "__flowTracer" }]],
      configFile: false,
      babelrc: false,
    });

    // Should NOT have instrumentation
    expect(result?.code).not.toContain("__flowTracer.enter");
    expect(result?.code).not.toContain("__flowTracer.exit");
  });

  it("should NOT instrument any @autotracer/* package code", () => {
    const input = `
      export function someUtilityFunction() {
        return doSomething();
      }
    `;

    const result = babel.transformSync(input, {
      filename: "/packages/auto-tracer-plugin-vite-flow/src/helpers.js",
      plugins: [[flowTracerBabelPlugin, { tracerName: "__flowTracer" }]],
      configFile: false,
      babelrc: false,
    });

    // Should NOT have instrumentation
    expect(result?.code).not.toContain("__flowTracer.enter");
    expect(result?.code).not.toContain("__flowTracer.exit");
  });

  it("should STILL instrument user application code", () => {
    const input = `
      function myFunction() {
        return 42;
      }
    `;

    const result = babel.transformSync(input, {
      filename: "/apps/example-flow-basic/src/App.tsx",
      plugins: [[flowTracerBabelPlugin, { tracerName: "__flowTracer" }]],
      configFile: false,
      babelrc: false,
    });

    // SHOULD have instrumentation for user code
    expect(result?.code).toContain("__flowTracer.enter");
    expect(result?.code).toContain("__flowTracer.exit");
  });

  it("should NOT instrument node_modules code", () => {
    const input = `
      export function reactFunction() {
        return createElement('div');
      }
    `;

    const result = babel.transformSync(input, {
      filename: "/node_modules/react/index.js",
      plugins: [[flowTracerBabelPlugin, { tracerName: "__flowTracer" }]],
      configFile: false,
      babelrc: false,
    });

    // Should NOT have instrumentation
    expect(result?.code).not.toContain("__flowTracer.enter");
    expect(result?.code).not.toContain("__flowTracer.exit");
  });

  it("demonstrates the actual bug: FlowTracer gets instrumented", () => {
    const input = `
      export function createFlowTracer(logger, config) {
        const mergedConfig = { ...DEFAULT_CONFIG, ...config };

        function enter(functionName, ...params) {
          const id = nextId++;
          callStack.push({ id, functionName });
          logger.enter(functionName, ...params);
          return id;
        }

        return { enter, exit };
      }
    `;

    const result = babel.transformSync(input, {
      filename: "/packages/auto-tracer-flow/dist/lib/FlowTracer.js",
      plugins: [[flowTracerBabelPlugin, { tracerName: "__flowTracer" }]],
      configFile: false,
      babelrc: false,
    });

    console.log("\n=== BUG DEMONSTRATION ===");
    console.log(
      "Input filename:",
      "/packages/auto-tracer-flow/dist/lib/FlowTracer.js"
    );
    console.log("\nTransformed code:");
    console.log(result?.code);
    console.log("\n=== END BUG DEMONSTRATION ===\n");

    // This test FAILS because the plugin incorrectly instruments FlowTracer
    // The code contains __flowTracer.enter() calls, which causes:
    // ReferenceError: __flowTracer is not defined
    // because we're in the middle of creating __flowTracer!
    expect(
      result?.code,
      "FlowTracer code should NOT be instrumented to avoid circular dependency"
    ).not.toContain("__flowTracer.enter");
  });
});
