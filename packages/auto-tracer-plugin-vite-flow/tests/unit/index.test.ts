import { describe, it, expect, vi, beforeEach } from "vitest";
import { flowTracer } from "../../src/index";
import { loadThemeFiles } from "@autotracer/flow/build-utils";

vi.mock("@autotracer/flow/build-utils", () => ({
  loadThemeFiles: vi.fn(),
}));

/**
 * Helper to extract transform function from plugin.
 * Vite plugins can have transform as a function or ObjectHook.
 */
function getTransform(plugin: ReturnType<typeof flowTracer>) {
  if (!plugin.transform) throw new Error("Plugin has no transform");
  if (typeof plugin.transform === "function") return plugin.transform;
  if (typeof plugin.transform === "object" && "handler" in plugin.transform) {
    return plugin.transform.handler;
  }
  throw new Error("Unexpected transform type");
}

/**
 * Helper to extract transformIndexHtml handler from plugin.
 * Vite plugins can have transformIndexHtml as a function or ObjectHook.
 */
function getTransformIndexHtmlHandler(plugin: ReturnType<typeof flowTracer>) {
  const hook = plugin.transformIndexHtml;
  if (!hook) throw new Error("Plugin has no transformIndexHtml");
  if (typeof hook === "function") return hook;
  if ("handler" in hook) return hook.handler;
  throw new Error("Unexpected transformIndexHtml type");
}

/**
 * Calls the configResolved hook on a plugin with a partial mock config.
 */
async function callConfigResolved(
  plugin: ReturnType<typeof flowTracer>,
  root: string,
  loggerWarn: ReturnType<typeof vi.fn>,
  command: "build" | "serve" = "build",
): Promise<void> {
  const hook = plugin.configResolved;
  if (typeof hook === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (hook as (config: any) => void | Promise<void>)({ root, command, logger: { warn: loggerWarn } } as any);
  } else if (hook && "handler" in hook) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (hook.handler as (config: any) => void | Promise<void>)({ root, command, logger: { warn: loggerWarn } } as any);
  }
}

describe("Vite Plugin Flow", () => {
  describe("plugin creation", () => {
    it("should create a plugin with correct name", () => {
      const plugin = flowTracer();

      expect(plugin.name).toBe("@autotracer/plugin-vite-flow");
    });

    it("should enforce 'pre' timing", () => {
      const plugin = flowTracer();

      expect(plugin.enforce).toBe("pre");
    });

    it("should be enabled by default", () => {
      const plugin = flowTracer();

      // Plugin should have a transform function
      expect(plugin.transform).toBeDefined();
    });

    it("should respect inject: false option", () => {
      const plugin = flowTracer({ inject: false });

      // Transform should still exist but return null for disabled state
      expect(plugin.transform).toBeDefined();
    });
  });

  describe("transform filtering", () => {
    it("should skip transformation when disabled", () => {
      const plugin = flowTracer({ inject: false });
      const transform = getTransform(plugin);
      const code = "function test() { return 42; }";

      const result = transform.call({} as any, code, "test.js");

      expect(result).toBeNull();
    });

    it("should skip node_modules", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);
      const code = "function test() { return 42; }";

      const result = transform.call(
        {} as any,
        code,
        "/path/to/node_modules/package/index.js",
      );

      expect(result).toBeNull();
    });

    it("should skip non-JS/TS files", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);
      const code = "function test() { return 42; }";

      const result = transform.call({} as any, code, "styles.css");

      expect(result).toBeNull();
    });

    it("should process .js files", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);
      const code = "function test() { return 42; }";

      const result = transform.call({} as any, code, "/project/src/test.js");

      expect(result).not.toBeNull();
      expect((result as any)?.code).toContain("__flowTracer");
    });

    it("should process .ts files", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);
      const code = "function test(): number { return 42; }";

      const result = transform.call({} as any, code, "/project/src/test.ts");

      expect(result).not.toBeNull();
      expect((result as any)?.code).toContain("__flowTracer");
    });

    it("should process .jsx files", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);
      const code =
        "function Component() { return React.createElement('div', null, 'Hello'); }";

      const result = transform.call(
        {} as any,
        code,
        "/project/src/Component.jsx",
      );

      expect(result).not.toBeNull();
      expect((result as any)?.code).toContain("__flowTracer");
    });

    it("should process .tsx files", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);
      const code =
        "function Component(): unknown { return React.createElement('div', null, 'Hello'); }";

      const result = transform.call(
        {} as any,
        code,
        "/project/src/Component.tsx",
      );

      expect(result).not.toBeNull();
      expect((result as any)?.code).toContain("__flowTracer");
    });

    it("should process .mjs files", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);
      const code = "export function test() { return 42; }";

      const result = transform.call({} as any, code, "/project/src/test.mjs");

      expect(result).not.toBeNull();
      expect((result as any)?.code).toContain("__flowTracer");
    });
  });

  describe("transform output", () => {
    it("should return transformed code", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);
      const code = "function test() { return 42; }";

      const result = transform.call(
        {} as any,
        code,
        "/project/src/test.js",
      ) as any;

      expect(result).toBeDefined();
      expect(result?.code).toBeDefined();
      expect(result?.code).toContain("__flowTracer.enter");
      expect(result?.code).toContain("__flowTracer.exit");
    });

    it("should return source map", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);
      const code = "function test() { return 42; }";

      const result = transform.call(
        {} as any,
        code,
        "/project/src/test.js",
      ) as any;

      expect(result?.map).toBeDefined();
    });

    it("should pass options to Babel plugin", () => {
      const plugin = flowTracer({
        tracerName: "customTracer",
        logExceptions: false,
      });
      const transform = getTransform(plugin);
      const code = "function test() { return 42; }";

      const result = transform.call(
        {} as any,
        code,
        "/project/src/test.js",
      ) as any;

      expect(result?.code).toContain("customTracer.enter");
      expect(result?.code).toContain("customTracer.exit");
      expect(result?.code).not.toContain("catch");
    });
  });

  describe("error handling", () => {
    it("should handle transform errors gracefully", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);
      const invalidCode = "function test() { this is invalid }";

      // Mock console.warn to verify error logging
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = transform.call(
        {} as any,
        invalidCode,
        "/project/src/test.js",
      );

      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0]?.[0]).toContain(
        "Flow tracer transform failed",
      );

      warnSpy.mockRestore();
    });
  });

  describe("configResolved hook", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(loadThemeFiles).mockResolvedValue({});
    });

    it("should load theme files with config root when enabled", async () => {
      vi.mocked(loadThemeFiles).mockResolvedValue({ functionEnter: {} });
      const plugin = flowTracer();

      await callConfigResolved(plugin, "/project/root", vi.fn());

      expect(loadThemeFiles).toHaveBeenCalledWith("/project/root");
    });

    it("should not load theme files when disabled", async () => {
      const plugin = flowTracer({ inject: false });

      await callConfigResolved(plugin, "/project/root", vi.fn());

      expect(loadThemeFiles).not.toHaveBeenCalled();
    });

    it("should reassign warn to use config.logger.warn after configResolved", async () => {
      const plugin = flowTracer();
      const loggerWarn = vi.fn();

      await callConfigResolved(plugin, "/project", loggerWarn);

      const transform = getTransform(plugin);
      transform.call(
        {} as any,
        "function test() { this is invalid }",
        "/project/src/test.js",
      );

      expect(loggerWarn).toHaveBeenCalled();
    });

    it("should handle Error instance from loadThemeFiles", async () => {
      vi.mocked(loadThemeFiles).mockRejectedValue(
        new Error("theme load failed"),
      );
      const plugin = flowTracer();
      const loggerWarn = vi.fn();

      await callConfigResolved(plugin, "/project", loggerWarn);

      expect(loggerWarn).toHaveBeenCalledWith(
        "[flowTracer] Failed to load theme files.",
      );
      expect(loggerWarn).toHaveBeenCalledWith("theme load failed");
    });

    it("should handle non-Error thrown from loadThemeFiles", async () => {
      vi.mocked(loadThemeFiles).mockRejectedValue("string error");
      const plugin = flowTracer();
      const loggerWarn = vi.fn();

      await callConfigResolved(plugin, "/project", loggerWarn);

      expect(loggerWarn).toHaveBeenCalledWith(
        "[flowTracer] Failed to load theme files.",
      );
      expect(loggerWarn).toHaveBeenCalledWith("string error");
    });
  });

  describe("transformIndexHtml hook", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(loadThemeFiles).mockResolvedValue({});
    });

    it("should return empty array when disabled", () => {
      const plugin = flowTracer({ inject: false });
      const handler = getTransformIndexHtmlHandler(plugin);

      const result = handler.call({} as any, "<html></html>", {} as any);

      expect(result).toEqual([]);
    });

    it("should inject bootstrap script by default", () => {
      const plugin = flowTracer();
      const handler = getTransformIndexHtmlHandler(plugin);

      const result = handler.call({} as any, "<html></html>", {} as any) as {
        children?: string;
      }[];

      expect(Array.isArray(result)).toBe(true);
      expect(
        result.some((tag) => tag.children?.includes("@autotracer/flow")),
      ).toBe(true);
    });

    it("should inject theme config script when themeConfig has keys", async () => {
      vi.mocked(loadThemeFiles).mockResolvedValue({
        functionEnter: { darkMode: { text: "#fff" } },
      });
      const plugin = flowTracer();
      await callConfigResolved(plugin, "/project", vi.fn());
      const handler = getTransformIndexHtmlHandler(plugin);

      const result = handler.call({} as any, "<html></html>", {} as any) as {
        children?: string;
      }[];

      expect(
        result.some((tag) => tag.children?.includes("__FLOWTRACER_THEME__")),
      ).toBe(true);
    });

    it("should not inject theme config script when themeConfig is empty", async () => {
      vi.mocked(loadThemeFiles).mockResolvedValue({});
      const plugin = flowTracer();
      await callConfigResolved(plugin, "/project", vi.fn());
      const handler = getTransformIndexHtmlHandler(plugin);

      const result = handler.call({} as any, "<html></html>", {} as any) as {
        children?: string;
      }[];

      expect(
        result.every((tag) => !tag.children?.includes("__FLOWTRACER_THEME__")),
      ).toBe(true);
    });

    it("should not inject dashboard config or mount script when dashboardConfig has enabled: false", () => {
      const plugin = flowTracer({ dashboardConfig: { enabled: false } });
      const handler = getTransformIndexHtmlHandler(plugin);

      const result = handler.call({} as any, "<html></html>", {} as any) as {
        children?: string;
      }[];

      expect(
        result.every(
          (tag) => !tag.children?.includes("__autoTracerDashboardConfig"),
        ),
      ).toBe(true);
      expect(
        result.every((tag) => !tag.children?.includes("mountDashboard")),
      ).toBe(true);
    });

    it("should inject dashboard config and mount script when dashboardConfig is provided", () => {
      const plugin = flowTracer({ dashboardConfig: { hideByDefault: true } });
      const handler = getTransformIndexHtmlHandler(plugin);

      const result = handler.call({} as any, "<html></html>", {} as any) as {
        children?: string;
      }[];

      expect(
        result.some((tag) =>
          tag.children?.includes("__autoTracerDashboardConfig"),
        ),
      ).toBe(true);
      expect(
        result.some((tag) => tag.children?.includes("mountDashboard")),
      ).toBe(true);
    });

    it.each([
      ["serve", /@autotracer\/dashboard\?autotracer-dashboard=\d+-\d+/u],
      ["build", /from "@autotracer\/dashboard"/u],
    ] as const)(
      "uses the expected Dashboard import while Vite runs %s",
      async (command, expectedImport) => {
        const plugin = flowTracer({ dashboardConfig: {} });
        await callConfigResolved(plugin, "/project", vi.fn(), command);
        const handler = getTransformIndexHtmlHandler(plugin);
        const result = handler.call({} as any, "<html></html>", {} as any) as {
          children?: string;
        }[];
        const mountScript = result.find((tag) =>
          tag.children?.includes("mountDashboard"),
        );

        expect(mountScript?.children).toMatch(expectedImport);
      },
    );

    it("should inject outputMode global script when outputMode is provided", () => {
      const plugin = flowTracer({ outputMode: "devtools" });
      const handler = getTransformIndexHtmlHandler(plugin);

      const result = handler.call({} as any, "<html></html>", {} as any) as {
        children?: string;
      }[];

      expect(
        result.some((tag) => tag.children?.includes("__autoTracerInternal")),
      ).toBe(true);
    });

    it("should use runtimeControlled import path by default", () => {
      const plugin = flowTracer();
      const handler = getTransformIndexHtmlHandler(plugin);

      const result = handler.call({} as any, "<html></html>", {} as any) as {
        children?: string;
      }[];

      expect(
        result.some((tag) =>
          tag.children?.includes("@autotracer/flow/runtime"),
        ),
      ).toBe(true);
    });

    it("should use runtimeControlled import path when runtimeControlled is true", () => {
      const plugin = flowTracer({ runtimeControlled: true });
      const handler = getTransformIndexHtmlHandler(plugin);

      const result = handler.call({} as any, "<html></html>", {} as any) as {
        children?: string;
      }[];

      expect(
        result.some((tag) =>
          tag.children?.includes("@autotracer/flow/runtime"),
        ),
      ).toBe(true);
    });

    it("should use normal flow import path when runtimeControlled is false", () => {
      const plugin = flowTracer({ runtimeControlled: false });
      const handler = getTransformIndexHtmlHandler(plugin);

      const result = handler.call({} as any, "<html></html>", {} as any) as {
        children?: string;
      }[];

      const bootstrapTag = result.find((tag) =>
        tag.children?.includes("@autotracer/flow"),
      );
      expect(bootstrapTag?.children).not.toContain("@autotracer/flow/runtime");
    });

    it("should inject setOutputMode call in bootstrap when outputMode is provided", () => {
      const plugin = flowTracer({ outputMode: "copy-paste" });
      const handler = getTransformIndexHtmlHandler(plugin);

      const result = handler.call({} as any, "<html></html>", {} as any) as {
        children?: string;
      }[];

      expect(
        result.some(
          (tag) =>
            tag.children?.includes("setOutputMode") &&
            tag.children?.includes("copy-paste"),
        ),
      ).toBe(true);
    });
  });

  describe("transform filtering - advanced", () => {
    it("should skip virtual module IDs starting with \\0", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);

      const result = transform.call(
        {} as any,
        "function test() {}",
        "\0virtual:module",
      );

      expect(result).toBeNull();
    });

    it("should skip IDs with query parameters", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);

      const result = transform.call(
        {} as any,
        "function test() {}",
        "/project/src/test.ts?raw",
      );

      expect(result).toBeNull();
    });

    it("should skip auto-tracer-flow package paths", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);

      const result = transform.call(
        {} as any,
        "function test() { return 42; }",
        "/project/packages/auto-tracer-flow/src/index.ts",
      );

      expect(result).toBeNull();
    });

    it("should skip auto-tracer-logger package paths", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);

      const result = transform.call(
        {} as any,
        "function test() { return 42; }",
        "/project/packages/auto-tracer-logger/dist/index.js",
      );

      expect(result).toBeNull();
    });

    it("should skip auto-tracer-plugin-* package paths", () => {
      const plugin = flowTracer();
      const transform = getTransform(plugin);

      const result = transform.call(
        {} as any,
        "function test() { return 42; }",
        "/project/packages/auto-tracer-plugin-babel-flow/src/index.ts",
      );

      expect(result).toBeNull();
    });

    it("should skip files not matching include paths", () => {
      const plugin = flowTracer({ include: { paths: ["**/src/**"] } });
      const transform = getTransform(plugin);

      const result = transform.call(
        {} as any,
        "function test() { return 42; }",
        "/project/lib/test.js",
      );

      expect(result).toBeNull();
    });

    it("should process files matching include paths", () => {
      const plugin = flowTracer({ include: { paths: ["**/src/**"] } });
      const transform = getTransform(plugin);

      const result = transform.call(
        {} as any,
        "function test() { return 42; }",
        "/project/src/test.js",
      );

      expect(result).not.toBeNull();
    });

    it("should skip files matching exclude paths", () => {
      const plugin = flowTracer({ exclude: { paths: ["**/generated/**"] } });
      const transform = getTransform(plugin);

      const result = transform.call(
        {} as any,
        "function test() { return 42; }",
        "/project/src/generated/test.js",
      );

      expect(result).toBeNull();
    });

    it("should process files not matching exclude paths", () => {
      const plugin = flowTracer({ exclude: { paths: ["**/generated/**"] } });
      const transform = getTransform(plugin);

      const result = transform.call(
        {} as any,
        "function test() { return 42; }",
        "/project/src/test.js",
      );

      expect(result).not.toBeNull();
    });
  });
});
