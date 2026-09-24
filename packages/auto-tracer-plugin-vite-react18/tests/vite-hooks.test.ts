/**
 * Tests for Vite-specific hooks in the React18 plugin.
 *
 * Covers: configResolved (theme loading, error handling, inject:false skip),
 * config (buildWithWorkspaceLibs + build command), transformIndexHtml (theme
 * injection, dashboard injection, enableBuildSupport UMD path), and
 * generateBundle (UMD asset emission).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mocks must be declared before imports of the modules that use them.
vi.mock("@autotracer/inject-react18", () => ({
  transform: vi.fn(),
  normalizeConfig: vi.fn(),
  shouldProcessFile: vi.fn(),
}));

vi.mock("@autotracer/react18/build-utils", () => ({
  loadThemeFiles: vi.fn(),
}));

import { reactTracer } from "../src/index";
import * as injectReact18 from "@autotracer/inject-react18";
import { loadThemeFiles } from "@autotracer/react18/build-utils";

const mockNormalizeConfig = vi.mocked(injectReact18.normalizeConfig);
const mockShouldProcessFile = vi.mocked(injectReact18.shouldProcessFile);
const mockLoadThemeFiles = vi.mocked(loadThemeFiles);

const DEFAULT_CONFIG: Required<injectReact18.TransformConfig> = {
  mode: "opt-out",
  include: { paths: ["**/*.{tsx,jsx}"], components: [] },
  exclude: { paths: [], components: [] },
  serverComponents: false,
  importSource: "@autotracer/react18",
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

// ---------------------------------------------------------------------------
// configResolved hook
// ---------------------------------------------------------------------------

describe("configResolved hook", () => {
  it("loads theme files using viteConfig.root when inject is enabled", async () => {
    const plugin = reactTracer.vite() as any;

    await plugin.configResolved({ root: "/my/project", base: "/" });

    expect(mockLoadThemeFiles).toHaveBeenCalledWith("/my/project");
  });

  it("captures viteBase from viteConfig.base", async () => {
    const plugin = reactTracer.vite({ buildWithWorkspaceLibs: true }) as any;
    mockLoadThemeFiles.mockResolvedValue({});

    await plugin.configResolved({ root: "/project", base: "/subpath/" });

    // Verify no throw — viteBase is internal, side-effects visible via transformIndexHtml
    const tags = plugin.transformIndexHtml.handler("");
    const umdTag = tags.tags?.find?.(
      (t: any) =>
        typeof t.attrs?.src === "string" &&
        String(t.attrs.src).includes("auto-tracer-react18"),
    );
    expect(umdTag?.attrs?.src).toContain("/subpath/");
  });

  it("stores returned theme so transformIndexHtml injects it", async () => {
    const theme = { component: "#ff0000" };
    mockLoadThemeFiles.mockResolvedValue(theme as never);

    const plugin = reactTracer.vite() as any;
    await plugin.configResolved({ root: "/project", base: "/" });

    const result = plugin.transformIndexHtml.handler("");
    const themeTag = result.tags?.find?.((t: any) =>
      String(t.children ?? "").includes("__REACTTRACER_THEME__"),
    );
    expect(themeTag).toBeDefined();
    expect(themeTag.children).toContain(JSON.stringify(theme));
  });

  it("falls back to empty theme and warns when loadThemeFiles throws", async () => {
    mockLoadThemeFiles.mockRejectedValue(new Error("disk error"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const plugin = reactTracer.vite() as any;
    await plugin.configResolved({ root: "/project", base: "/" });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[reactTracer] Failed to load theme files:"),
      expect.any(Error),
    );

    // transformIndexHtml should still work (empty theme → no theme tag)
    const result = plugin.transformIndexHtml.handler("");
    expect(result).toBeDefined();

    warnSpy.mockRestore();
  });

  it("skips theme loading when inject is false", async () => {
    const plugin = reactTracer.vite({ inject: false }) as any;

    await plugin.configResolved({ root: "/project", base: "/" });

    expect(mockLoadThemeFiles).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// config hook (buildWithWorkspaceLibs + build command)
// ---------------------------------------------------------------------------

describe("config hook", () => {
  it("adds external-globals plugin when buildWithWorkspaceLibs and command is build (no existing plugins)", () => {
    const plugin = reactTracer.vite({ buildWithWorkspaceLibs: true }) as any;
    const viteConfig: any = {};

    plugin.config(viteConfig, { command: "build" });

    expect(Array.isArray(viteConfig.build.rollupOptions.plugins)).toBe(true);
    expect(viteConfig.build.rollupOptions.plugins.length).toBeGreaterThan(0);
  });

  it("pushes to existing rollupOptions.plugins array when one is already set", () => {
    const plugin = reactTracer.vite({ buildWithWorkspaceLibs: true }) as any;
    const existing = { name: "some-plugin" };
    const viteConfig: any = {
      build: { rollupOptions: { plugins: [existing] } },
    };

    plugin.config(viteConfig, { command: "build" });

    expect(viteConfig.build.rollupOptions.plugins.length).toBe(2);
    expect(viteConfig.build.rollupOptions.plugins[0]).toBe(existing);
  });

  it("does nothing when command is not build", () => {
    const plugin = reactTracer.vite({ buildWithWorkspaceLibs: true }) as any;
    const viteConfig: any = {};

    plugin.config(viteConfig, { command: "serve" });

    expect(viteConfig.build).toBeUndefined();
  });

  it("does nothing when buildWithWorkspaceLibs is false", () => {
    const plugin = reactTracer.vite({ buildWithWorkspaceLibs: false }) as any;
    const viteConfig: any = {};

    plugin.config(viteConfig, { command: "build" });

    expect(viteConfig.build).toBeUndefined();
  });

  it("does nothing when inject is false even if buildWithWorkspaceLibs is true", () => {
    const plugin = reactTracer.vite({
      inject: false,
      buildWithWorkspaceLibs: true,
    }) as any;
    const viteConfig: any = {};

    plugin.config(viteConfig, { command: "build" });

    expect(viteConfig.build).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// transformIndexHtml hook — theme and dashboard injection
// ---------------------------------------------------------------------------

describe("transformIndexHtml hook", () => {
  it("injects theme script when loadThemeFiles returns a non-empty theme", async () => {
    const theme = { component: "#aabbcc" };
    mockLoadThemeFiles.mockResolvedValue(theme as never);

    const plugin = reactTracer.vite() as any;
    await plugin.configResolved({ root: "/project", base: "/" });

    const result = plugin.transformIndexHtml.handler("");
    const themeTag = result.tags.find((t: any) =>
      String(t.children ?? "").includes("__REACTTRACER_THEME__"),
    );

    expect(themeTag).toBeDefined();
    expect(themeTag.injectTo).toBe("head-prepend");
  });

  it("does not inject dashboard config or mount script when dashboardConfig has enabled: false", () => {
    const plugin = reactTracer.vite({
      dashboardConfig: { enabled: false },
    }) as any;

    const result = plugin.transformIndexHtml.handler("");
    const dashboardTag = result.tags.find((t: any) =>
      String(t.children ?? "").includes("__autoTracerDashboardConfig"),
    );
    const mountTag = result.tags.find((t: any) =>
      String(t.children ?? "").includes("mountDashboard"),
    );

    expect(dashboardTag).toBeUndefined();
    expect(mountTag).toBeUndefined();
  });

  it("injects dashboard config and mount script when dashboardConfig is provided", () => {
    const dashboardConfig = {
      enabled: true,
      position: "bottom-right" as const,
    };
    const plugin = reactTracer.vite({ dashboardConfig }) as any;

    const result = plugin.transformIndexHtml.handler("");
    const dashboardTag = result.tags.find((t: any) =>
      String(t.children ?? "").includes("__autoTracerDashboardConfig"),
    );
    const mountTag = result.tags.find((t: any) =>
      String(t.children ?? "").includes("mountDashboard"),
    );

    expect(dashboardTag).toBeDefined();
    expect(dashboardTag.injectTo).toBe("head-prepend");
    expect(mountTag).toBeDefined();
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

  it("returns the original html when inject is false", () => {
    const html = "<html></html>";
    const plugin = reactTracer.vite({
      inject: false,
      buildWithWorkspaceLibs: true,
      outputMode: "devtools",
      dashboardConfig: { enabled: true },
    }) as any;

    const result = plugin.transformIndexHtml.handler(html);

    expect(result).toBe(html);
  });

  it("returns the original html when TRACE_INJECT is 0", () => {
    process.env.TRACE_INJECT = "0";
    const html = "<html></html>";
    const plugin = reactTracer.vite({
      buildWithWorkspaceLibs: true,
      outputMode: "devtools",
      dashboardConfig: { enabled: true },
    }) as any;

    const result = plugin.transformIndexHtml.handler(html);

    expect(result).toBe(html);
  });

  it("does not inject outputMode script when outputMode is not set", () => {
    const plugin = reactTracer.vite() as any;

    const result = plugin.transformIndexHtml.handler("");
    const outputModeTag = result.tags.find((t: any) =>
      String(t.children ?? "").includes("__autoTracerInternal"),
    );

    expect(outputModeTag).toBeUndefined();
  });

  it("injects outputMode script when outputMode is set and inject is enabled", () => {
    const plugin = reactTracer.vite({ outputMode: "devtools" }) as any;

    const result = plugin.transformIndexHtml.handler("");
    const outputModeTag = result.tags.find((t: any) =>
      String(t.children ?? "").includes("__autoTracerInternal"),
    );

    expect(outputModeTag).toBeDefined();
    expect(String(outputModeTag.children)).toContain("devtools");
  });

  it("returns tags without UMD scripts when enableBuildSupport is false", () => {
    const plugin = reactTracer.vite({ outputMode: "devtools" }) as any;

    const result = plugin.transformIndexHtml.handler("");
    const umdTags = result.tags.filter(
      (t: any) => typeof t.attrs?.src === "string",
    );

    expect(umdTags).toHaveLength(0);
  });
});

// Note: generateBundle tests (emitFile assertions, readFileSync mocking) live in
// generate-bundle.test.ts where the "fs" module is mocked at the module level.
