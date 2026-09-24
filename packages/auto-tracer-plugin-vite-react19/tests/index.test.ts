import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ComponentInfo,
  TransformConfig,
} from "@autotracer/inject-react19";
import type { ReactTracerOptions } from "../src/index";

vi.mock("@autotracer/inject-react19", () => ({
  transform: vi.fn(),
  normalizeConfig: vi.fn(),
  shouldProcessFile: vi.fn(),
}));

import { reactTracer } from "../src/index";
import {
  normalizeConfig,
  shouldProcessFile,
  transform,
} from "@autotracer/inject-react19";

const mockTransform = vi.mocked(transform);
const mockNormalizeConfig = vi.mocked(normalizeConfig);
const mockShouldProcessFile = vi.mocked(shouldProcessFile);

const DEFAULT_CONFIG: Required<TransformConfig> = {
  mode: "opt-out",
  include: { paths: ["**/*.tsx"], components: [] },
  exclude: { paths: [], components: [] },
  serverComponents: false,
  importSource: "@autotracer/react19",
  labelHooks: [],
  labelHooksPattern: "",
};

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.NODE_ENV;
  delete process.env.TRACE_INJECT;
  mockNormalizeConfig.mockReturnValue(DEFAULT_CONFIG);
  mockShouldProcessFile.mockReturnValue(true);
  const mockComponent: ComponentInfo = {
    name: "TestComponent",
    isAnonymous: false,
    node: {},
  };
  mockTransform.mockReturnValue({
    code: "transformed code",
    injected: true,
    components: [mockComponent],
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("@autotracer/plugin-vite-react19", () => {
  it("creates an unplugin instance", () => {
    expect(reactTracer).toBeDefined();
    expect(typeof reactTracer).toBe("object");
    expect(reactTracer).toHaveProperty("vite");
  });

  it("creates a Vite plugin with default options", () => {
    const vitePlugin = reactTracer.vite();

    expect(vitePlugin).toBeDefined();
    expect(Array.isArray(vitePlugin)).toBe(false);
    expect(typeof vitePlugin).toBe("object");
  });

  it("passes custom options to normalizeConfig", () => {
    const options: ReactTracerOptions = {
      mode: "opt-in",
      include: { paths: ["src/**/*.tsx"] },
      exclude: { paths: ["**/*.test.*"] },
    };

    reactTracer.vite(options);

    expect(mockNormalizeConfig).toHaveBeenCalledWith(options);
  });

  it("creates the expected Vite plugin structure", () => {
    const vitePlugin = reactTracer.vite();

    expect(vitePlugin).toHaveProperty("name", "auto-tracer-inject");
    expect(vitePlugin).toHaveProperty("enforce", "pre");
  });

  it("supports all transformer options", () => {
    const options: ReactTracerOptions = {
      mode: "opt-in",
      include: { paths: ["src/**/*.tsx", "components/**/*.jsx"] },
      exclude: { paths: ["**/*.test.*", "**/*.spec.*"] },
      importSource: "custom-tracer",
      labelHooks: ["useState", "useCustomHook"],
      labelHooksPattern: "^use[A-Z].*",
    };

    reactTracer.vite(options);

    expect(mockNormalizeConfig).toHaveBeenCalledWith(options);
  });

  it("exposes the Vite adapter through the default export contract", async () => {
    const module = await import("../src/index");
    const options: ReactTracerOptions = { inject: false };
    const vitePlugin: any = module.default(options);

    expect(vitePlugin.name).toBe("auto-tracer-inject");
    expect(vitePlugin.enforce).toBe("pre");
    expect(vitePlugin.transformInclude("src/Component.tsx")).toBe(false);
  });
});

describe("transformInclude", () => {
  it("excludes files when injection is disabled by option", () => {
    const vitePlugin: any = reactTracer.vite({ inject: false });

    expect(vitePlugin.transformInclude("src/Component.tsx")).toBe(false);
    expect(mockShouldProcessFile).not.toHaveBeenCalled();
  });

  it("includes eligible files when injection is enabled", () => {
    const vitePlugin: any = reactTracer.vite({ inject: true });

    expect(vitePlugin.transformInclude("src/Component.tsx")).toBe(true);
    expect(mockShouldProcessFile).toHaveBeenCalledWith(
      "src/Component.tsx",
      expect.any(Object),
    );
  });

  it("defaults injection to enabled", () => {
    const vitePlugin: any = reactTracer.vite();

    expect(vitePlugin.transformInclude("src/Component.tsx")).toBe(true);
  });

  it("includes eligible files in development mode", () => {
    process.env.NODE_ENV = "development";
    const vitePlugin: any = reactTracer.vite();

    expect(vitePlugin.transformInclude("src/Component.tsx")).toBe(true);
    expect(mockShouldProcessFile).toHaveBeenCalledWith(
      "src/Component.tsx",
      expect.any(Object),
    );
  });

  it("includes eligible files when NODE_ENV is unset", () => {
    const vitePlugin: any = reactTracer.vite();

    expect(vitePlugin.transformInclude("src/Component.tsx")).toBe(true);
    expect(mockShouldProcessFile).toHaveBeenCalledWith(
      "src/Component.tsx",
      expect.any(Object),
    );
  });

  it("excludes files when TRACE_INJECT is disabled", () => {
    process.env.TRACE_INJECT = "0";
    const vitePlugin: any = reactTracer.vite();

    expect(vitePlugin.transformInclude("src/Component.tsx")).toBe(false);
  });

  it("respects shouldProcessFile", () => {
    mockShouldProcessFile.mockReturnValue(false);
    const vitePlugin: any = reactTracer.vite();

    expect(vitePlugin.transformInclude("src/Component.tsx")).toBe(false);
  });
});

describe("transform", () => {
  it("returns transformed code and module type when injection occurs", () => {
    const vitePlugin: any = reactTracer.vite();

    const result = vitePlugin.transform(
      "function MyComponent() { return <div />; }",
      "src/Component.tsx",
    );

    expect(mockTransform).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        filename: "src/Component.tsx",
        config: expect.any(Object),
      }),
    );
    expect(result).toEqual({
      code: "transformed code",
      map: undefined,
      moduleType: "js",
    });
  });

  it("returns null when no injection occurs", () => {
    mockTransform.mockReturnValue({
      code: "original code",
      injected: false,
      components: [],
    });
    const vitePlugin: any = reactTracer.vite();

    expect(vitePlugin.transform("const value = 1;", "src/value.ts")).toBe(null);
  });

  it("handles transform errors without failing the build", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockTransform.mockImplementation(() => {
      throw new Error("Transform failed");
    });
    const vitePlugin: any = reactTracer.vite();

    expect(vitePlugin.transform("const value = 1;", "src/value.ts")).toBe(null);
    expect(warnSpy).toHaveBeenCalledWith(
      "Auto-trace transform failed for src/value.ts:",
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  it("returns an available source map", () => {
    mockTransform.mockReturnValue({
      code: "transformed code",
      injected: true,
      components: [],
      map: { version: 3, sources: [], mappings: "" },
    });
    const vitePlugin: any = reactTracer.vite();

    expect(vitePlugin.transform("const value = 1;", "src/value.ts")).toEqual({
      code: "transformed code",
      map: { version: 3, sources: [], mappings: "" },
      moduleType: "js",
    });
  });
});

const getTagsFromPlugin = (options: ReactTracerOptions): any[] => {
  const plugin = reactTracer.vite(options);
  if (Array.isArray(plugin)) {
    throw new Error("Expected a single Vite plugin instance");
  }
  const transformIndexHtml = plugin.transformIndexHtml;
  if (
    transformIndexHtml === undefined ||
    typeof transformIndexHtml === "function"
  ) {
    throw new Error("Expected an object transformIndexHtml hook");
  }
  const handler = Reflect.get(transformIndexHtml, "handler");
  if (typeof handler !== "function") {
    throw new Error("Expected transformIndexHtml.handler");
  }
  const result: unknown = Reflect.apply(handler, {}, [
    "",
    { path: "/", filename: "/index.html" },
  ]);
  if (typeof result !== "object" || result === null) {
    throw new Error("Expected transformIndexHtml result");
  }
  const tags: unknown = Reflect.get(result, "tags");
  if (!Array.isArray(tags)) {
    throw new Error("Expected transformIndexHtml tags");
  }
  return tags;
};

describe("React 19 workspace build scripts", () => {
  it("requires an explicit React global script source", () => {
    expect(() =>
      getTagsFromPlugin({
        buildWithWorkspaceLibs: true,
        reactDomUmdSrc: "/vendor/react-dom.global.js",
      }),
    ).toThrowError(
      "React 19 does not publish an official UMD build. Set reactUmdSrc when buildWithWorkspaceLibs is true.",
    );
  });

  it("requires an explicit ReactDOM global script source", () => {
    expect(() =>
      getTagsFromPlugin({
        buildWithWorkspaceLibs: true,
        reactUmdSrc: "/vendor/react.global.js",
      }),
    ).toThrowError(
      "React 19 does not publish an official UMD build. Set reactDomUmdSrc when buildWithWorkspaceLibs is true.",
    );
  });

  it("uses both explicitly configured global script sources", () => {
    const tags = getTagsFromPlugin({
      buildWithWorkspaceLibs: true,
      reactUmdSrc: "/assets/react.global.js",
      reactDomUmdSrc: "/assets/react-dom.global.js",
    });
    const sources = tags
      .filter((tag: any) => typeof tag.attrs?.src === "string")
      .map((tag: any) => String(tag.attrs.src));

    expect(sources).toContain("/assets/react.global.js");
    expect(sources).toContain("/assets/react-dom.global.js");
    expect(sources).toContain("/auto-tracer-react19.umd.js");
  });

  it("does not inject script sources when workspace build support is disabled", () => {
    const tags = getTagsFromPlugin({
      buildWithWorkspaceLibs: false,
      reactUmdSrc: "/assets/react.global.js",
      reactDomUmdSrc: "/assets/react-dom.global.js",
    });

    expect(
      tags.filter((tag: any) => typeof tag.attrs?.src === "string"),
    ).toHaveLength(0);
  });
});
