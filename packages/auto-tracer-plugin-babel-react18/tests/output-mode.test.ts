import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import plugin from "../src/index";

const clientComponentCode = `
  "use client";

  export function ClientHello() {
    const [count, setCount] = useState(0);
    return <div>Client Hello {count}</div>;
  }
`;

describe("@autotracer/plugin-babel-react18 outputMode", () => {
  it("injects a seed-only startup outputMode bootstrap after 'use client'", () => {
    const originalTraceInject = process.env.TRACE_INJECT;
    process.env.TRACE_INJECT = "1";

    try {
      const result = transformSync(clientComponentCode, {
        filename: "ClientComponent.tsx",
        plugins: [[plugin, { mode: "opt-out", outputMode: "copy-paste" }]],
        parserOpts: {
          sourceType: "module",
          plugins: ["typescript", "jsx"],
        },
        generatorOpts: {
          retainLines: true,
        },
        babelrc: false,
        configFile: false,
        sourceMaps: false,
      });

      const code = result?.code ?? "";

      const useClientIndex = Math.max(
        code.indexOf('"use client"'),
        code.indexOf("'use client'"),
      );
      const internalIndex = code.indexOf("__autoTracerInternal");

      expect(useClientIndex).toBeGreaterThanOrEqual(0);
      expect(internalIndex).toBeGreaterThanOrEqual(0);
      expect(useClientIndex).toBeLessThan(internalIndex);

      expect(code).toContain("__autoTracerInternal === undefined");
      expect(code).toContain("autoTracer.setOutputMode");
    } finally {
      if (originalTraceInject !== undefined) {
        process.env.TRACE_INJECT = originalTraceInject;
      } else {
        delete process.env.TRACE_INJECT;
      }
    }
  });

  it("does not inject outputMode bootstrap when outputMode is undefined", () => {
    const originalTraceInject = process.env.TRACE_INJECT;
    process.env.TRACE_INJECT = "1";

    try {
      const result = transformSync(clientComponentCode, {
        filename: "ClientComponent.tsx",
        plugins: [[plugin, { mode: "opt-out" }]],
        parserOpts: {
          sourceType: "module",
          plugins: ["typescript", "jsx"],
        },
        generatorOpts: {
          retainLines: true,
        },
        babelrc: false,
        configFile: false,
        sourceMaps: false,
      });

      const code = result?.code ?? "";
      expect(code).not.toContain("__autoTracerInternal === undefined");
      expect(code).not.toContain("autoTracer.setOutputMode");
    } finally {
      if (originalTraceInject !== undefined) {
        process.env.TRACE_INJECT = originalTraceInject;
      } else {
        delete process.env.TRACE_INJECT;
      }
    }
  });
});
