import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@autotracer/inject-react19", () => ({
  transform: vi.fn(),
  normalizeConfig: vi.fn(),
  shouldProcessFile: vi.fn(),
}));

vi.mock("@autotracer/react19/build-utils", () => ({
  loadThemeFiles: vi.fn(),
}));

import { reactTracer } from "../src/index";
import * as injectReact19 from "@autotracer/inject-react19";
import { loadThemeFiles } from "@autotracer/react19/build-utils";

const mockNormalizeConfig = vi.mocked(injectReact19.normalizeConfig);
const mockShouldProcessFile = vi.mocked(injectReact19.shouldProcessFile);
const mockLoadThemeFiles = vi.mocked(loadThemeFiles);

const DEFAULT_CONFIG: Required<injectReact19.TransformConfig> = {
  mode: "opt-out",
  include: { paths: ["**/*.{tsx,jsx}"], components: [] },
  exclude: { paths: [], components: [] },
  serverComponents: false,
  importSource: "@autotracer/react19",
  labelHooks: [],
  labelHooksPattern: "",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockNormalizeConfig.mockReturnValue(DEFAULT_CONFIG);
  mockShouldProcessFile.mockReturnValue(true);
  mockLoadThemeFiles.mockResolvedValue({});
});

afterEach(() => {
  delete process.env.TRACE_INJECT;
});

describe("configResolved hook", () => {
  it("loads theme files using viteConfig.root", async () => {
    const plugin = reactTracer.vite() as any;

    await plugin.configResolved({ root: "/my/project", base: "/" });

    expect(mockLoadThemeFiles).toHaveBeenCalledWith("/my/project");
  });

  it("captures viteConfig.base for the tracer UMD asset", async () => {
    const plugin = reactTracer.vite({
      buildWithWorkspaceLibs: true,
      reactUmdSrc: "/vendor/react-19.global.js",
      reactDomUmdSrc: "/vendor/react-dom-19.global.js",
    }) as any;

    await plugin.configResolved({ root: "/project", base: "/subpath/" });

    const result = plugin.transformIndexHtml.handler("");
    const tracerTag = result.tags.find((tag: any) =>
      String(tag.attrs?.src ?? "").includes("auto-tracer-react19"),
    );
    expect(tracerTag.attrs.src).toContain("/subpath/");
  });

  it("stores a loaded theme for HTML injection", async () => {
    const theme = { component: "#ff0000" };
    mockLoadThemeFiles.mockResolvedValue(theme as never);
    const plugin = reactTracer.vite() as any;

    await plugin.configResolved({ root: "/project", base: "/" });

    const result = plugin.transformIndexHtml.handler("");
    const themeTag = result.tags.find((tag: any) =>
      String(tag.children ?? "").includes("__REACTTRACER_THEME__"),
    );
    expect(themeTag.children).toContain(JSON.stringify(theme));
  });

  it("warns and falls back to an empty theme when loading fails", async () => {
    mockLoadThemeFiles.mockRejectedValue(new Error("disk error"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const plugin = reactTracer.vite() as any;

    await plugin.configResolved({ root: "/project", base: "/" });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[reactTracer] Failed to load theme files:"),
      expect.any(Error),
    );
    expect(plugin.transformIndexHtml.handler("")).toBeDefined();
    warnSpy.mockRestore();
  });

  it("skips theme loading when injection is disabled", async () => {
    const plugin = reactTracer.vite({ inject: false }) as any;

    await plugin.configResolved({ root: "/project", base: "/" });

    expect(mockLoadThemeFiles).not.toHaveBeenCalled();
  });
});

describe("config hook", () => {
  it("adds external globals for a supported workspace build", () => {
    const plugin = reactTracer.vite({ buildWithWorkspaceLibs: true }) as any;
    const viteConfig: any = {};

    plugin.config(viteConfig, { command: "build" });

    expect(Array.isArray(viteConfig.build.rollupOptions.plugins)).toBe(true);
    expect(viteConfig.build.rollupOptions.plugins.length).toBeGreaterThan(0);
  });

  it("appends to existing Rollup plugins", () => {
    const existing = { name: "some-plugin" };
    const viteConfig: any = {
      build: { rollupOptions: { plugins: [existing] } },
    };
    const plugin = reactTracer.vite({ buildWithWorkspaceLibs: true }) as any;

    plugin.config(viteConfig, { command: "build" });

    expect(viteConfig.build.rollupOptions.plugins).toHaveLength(2);
    expect(viteConfig.build.rollupOptions.plugins[0]).toBe(existing);
  });

  it.each([
    { options: { buildWithWorkspaceLibs: true }, command: "serve" },
    { options: { buildWithWorkspaceLibs: false }, command: "build" },
    {
      options: { inject: false, buildWithWorkspaceLibs: true },
      command: "build",
    },
  ])("does not rewrite unsupported build configuration", ({ options, command }) => {
    const plugin = reactTracer.vite(options) as any;
    const viteConfig: any = {};

    plugin.config(viteConfig, { command });

    expect(viteConfig.build).toBeUndefined();
  });
});

describe("transformIndexHtml hook", () => {
  it("injects a loaded theme into head-prepend", async () => {
    mockLoadThemeFiles.mockResolvedValue({ component: "#aabbcc" } as never);
    const plugin = reactTracer.vite() as any;
    await plugin.configResolved({ root: "/project", base: "/" });

    const result = plugin.transformIndexHtml.handler("");
    const themeTag = result.tags.find((tag: any) =>
      String(tag.children ?? "").includes("__REACTTRACER_THEME__"),
    );

    expect(themeTag.injectTo).toBe("head-prepend");
  });

  it("omits a disabled dashboard", () => {
    const plugin = reactTracer.vite({
      dashboardConfig: { enabled: false },
    }) as any;

    const result = plugin.transformIndexHtml.handler("");

    expect(
      result.tags.find((tag: any) =>
        String(tag.children ?? "").includes("__autoTracerDashboardConfig"),
      ),
    ).toBeUndefined();
    expect(
      result.tags.find((tag: any) =>
        String(tag.children ?? "").includes("mountDashboard"),
      ),
    ).toBeUndefined();
  });

  it("injects dashboard configuration and mount script", () => {
    const plugin = reactTracer.vite({
      dashboardConfig: { enabled: true, position: "bottom-right" },
    }) as any;

    const result = plugin.transformIndexHtml.handler("");
    const dashboardTag = result.tags.find((tag: any) =>
      String(tag.children ?? "").includes("__autoTracerDashboardConfig"),
    );
    const mountTag = result.tags.find((tag: any) =>
      String(tag.children ?? "").includes("mountDashboard"),
    );

    expect(dashboardTag.injectTo).toBe("head-prepend");
    expect(mountTag.injectTo).toBe("head-prepend");
  });

  it.each([
    ["serve", /@autotracer\/dashboard\?autotracer-dashboard=\d+-\d+/u],
    ["build", /from "@autotracer\/dashboard"/u],
  ])(
    "uses the expected Dashboard import while Vite runs %s",
    async (command, expectedImport) => {
      const plugin = reactTracer.vite({ dashboardConfig: {} }) as any;
      await plugin.configResolved({ root: "/project", base: "/", command });

      const result = plugin.transformIndexHtml.handler("");
      const mountTag = result.tags.find((tag: any) =>
        String(tag.children ?? "").includes("mountDashboard"),
      );

      expect(mountTag.children).toMatch(expectedImport);
    },
  );

  it.each([
    { options: { inject: false }, traceInject: undefined },
    { options: {}, traceInject: "0" },
  ])("returns original HTML when disabled", ({ options, traceInject }) => {
    if (traceInject !== undefined) {
      process.env.TRACE_INJECT = traceInject;
    }
    const html = "<html></html>";
    const plugin = reactTracer.vite(options) as any;

    expect(plugin.transformIndexHtml.handler(html)).toBe(html);
  });

  it("injects output mode only when configured", () => {
    const unsetPlugin = reactTracer.vite() as any;
    const configuredPlugin = reactTracer.vite({ outputMode: "devtools" }) as any;

    const unsetResult = unsetPlugin.transformIndexHtml.handler("");
    const configuredResult = configuredPlugin.transformIndexHtml.handler("");

    expect(
      unsetResult.tags.find((tag: any) =>
        String(tag.children ?? "").includes("__autoTracerInternal"),
      ),
    ).toBeUndefined();
    expect(
      configuredResult.tags.find((tag: any) =>
        String(tag.children ?? "").includes("__autoTracerInternal"),
      ),
    ).toBeDefined();
  });

  it("omits external script sources outside workspace build support", () => {
    const plugin = reactTracer.vite({ outputMode: "devtools" }) as any;

    const result = plugin.transformIndexHtml.handler("");

    expect(
      result.tags.filter((tag: any) => typeof tag.attrs?.src === "string"),
    ).toHaveLength(0);
  });
});
