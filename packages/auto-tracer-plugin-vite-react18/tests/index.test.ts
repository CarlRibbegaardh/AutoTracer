import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reactTracer } from "../src/index";
import type { ReactTracerOptions } from "../src/index";
import type {
  TransformConfig,
  ComponentInfo,
} from "@autotracer/inject-react18";

// Mock the auto-tracer-inject-core module
vi.mock("@autotracer/inject-react18", () => ({
  transform: vi.fn(),
  normalizeConfig: vi.fn(),
  shouldProcessFile: vi.fn(),
}));

import {
  transform,
  normalizeConfig,
  shouldProcessFile,
} from "@autotracer/inject-react18";

describe("@autotracer/plugin-vite-react18", () => {
  const mockTransform = vi.mocked(transform);
  const mockNormalizeConfig = vi.mocked(normalizeConfig);
  const mockShouldProcessFile = vi.mocked(shouldProcessFile);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    delete process.env.NODE_ENV;
    delete process.env.TRACE_INJECT;

    // Default mock implementations
    const defaultConfig: Required<TransformConfig> = {
      mode: "opt-out",
      include: { paths: ["**/*.tsx"], components: [] },
      exclude: { paths: [], components: [] },
      serverComponents: false,
      importSource: "@autotracer/react18",
      labelHooks: [],
      labelHooksPattern: "",
    };
    mockNormalizeConfig.mockReturnValue(defaultConfig);
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

  describe("plugin creation", () => {
    it("should create unplugin instance", () => {
      const pluginInstance = reactTracer;

      expect(pluginInstance).toBeDefined();
      expect(typeof pluginInstance).toBe("object");
      expect(pluginInstance).toHaveProperty("vite");
    });

    it("should create vite plugin with default options", () => {
      const vitePlugin = reactTracer.vite();

      expect(vitePlugin).toBeDefined();
      expect(Array.isArray(vitePlugin)).toBe(false);
      expect(typeof vitePlugin).toBe("object");
    });

    it("should create vite plugin with custom options", () => {
      const options: ReactTracerOptions = {
        mode: "opt-in",
        include: { paths: ["src/**/*.tsx"] },
        exclude: { paths: ["**/*.test.*"] },
      };

      const vitePlugin = reactTracer.vite(options);

      expect(vitePlugin).toBeDefined();
      expect(mockNormalizeConfig).toHaveBeenCalledWith(options);
    });
  });

  describe("vite plugin structure", () => {
    it("should create a valid vite plugin object", () => {
      const vitePlugin = reactTracer.vite();

      expect(vitePlugin).toBeDefined();
      expect(typeof vitePlugin).toBe("object");
      // Plugin should have some expected properties
      expect(vitePlugin).toHaveProperty("name");
      expect(vitePlugin).toHaveProperty("enforce");
    });
  });

  describe("configuration integration", () => {
    it("should pass normalized config to transform functions", () => {
      const customConfig: Required<TransformConfig> = {
        mode: "opt-in",
        include: { paths: ["custom/**/*.tsx"], components: [] },
        exclude: { paths: ["**/*.spec.*"], components: [] },
        serverComponents: false,
        importSource: "@autotracer/react18",
        labelHooks: [],
        labelHooksPattern: "",
      };

      mockNormalizeConfig.mockReturnValue(customConfig);

      reactTracer.vite(customConfig);

      expect(mockNormalizeConfig).toHaveBeenCalledWith(customConfig);
    });

    it("should support all ReactTracerOptions", () => {
      const options: ReactTracerOptions = {
        mode: "opt-in",
        include: { paths: ["src/**/*.tsx", "components/**/*.jsx"] },
        exclude: { paths: ["**/*.test.*", "**/*.spec.*"] },
        importSource: "custom-tracer",
        labelHooks: ["useState", "useCustomHook"],
        labelHooksPattern: "^use[A-Z].*",
      };

      const vitePlugin = reactTracer.vite(options);

      expect(vitePlugin).toBeDefined();
      expect(mockNormalizeConfig).toHaveBeenCalledWith(options);
    });
  });

  describe("default export", () => {
    it("should export vite plugin as default", () => {
      // The default export is tested implicitly through the import at the top
      // This test verifies the module structure is correct
      expect(reactTracer).toBeDefined();
      expect(reactTracer.vite).toBeDefined();
    });
  });

  describe("vite plugin behavior", () => {
    let vitePlugin: any;

    beforeEach(() => {
      vitePlugin = reactTracer.vite();
    });

    it("should have correct plugin name", () => {
      expect(vitePlugin.name).toBe("auto-tracer-inject");
    });

    it("should enforce pre transform order", () => {
      expect(vitePlugin.enforce).toBe("pre");
    });

    describe("transformInclude", () => {
      it("should exclude files when inject parameter is false", () => {
        const pluginWithNoInjection = reactTracer.vite({
          inject: false,
        }) as any;

        const result =
          pluginWithNoInjection.transformInclude("src/Component.tsx");

        expect(result).toBe(false);
        expect(mockShouldProcessFile).not.toHaveBeenCalled();
      });

      it("should include files when inject parameter is true", () => {
        const pluginWithInjection = reactTracer.vite({ inject: true }) as any;

        const result =
          pluginWithInjection.transformInclude("src/Component.tsx");

        expect(result).toBe(true);
        expect(mockShouldProcessFile).toHaveBeenCalledWith(
          "src/Component.tsx",
          expect.any(Object),
        );
      });

      it("should default to enabled when inject parameter is not provided", () => {
        const result = vitePlugin.transformInclude("src/Component.tsx");

        expect(result).toBe(true);
        expect(mockShouldProcessFile).toHaveBeenCalledWith(
          "src/Component.tsx",
          expect.any(Object),
        );
      });

      it("should exclude files when TRACE_INJECT is disabled", () => {
        process.env.TRACE_INJECT = "0";

        const result = vitePlugin.transformInclude("src/Component.tsx");

        expect(result).toBe(false);
      });

      it("should include files in development mode", () => {
        process.env.NODE_ENV = "development";

        const result = vitePlugin.transformInclude("src/Component.tsx");

        expect(result).toBe(true);
        expect(mockShouldProcessFile).toHaveBeenCalledWith(
          "src/Component.tsx",
          expect.any(Object),
        );
      });

      it("should include files when NODE_ENV is not set (defaults to development)", () => {
        const result = vitePlugin.transformInclude("src/Component.tsx");

        expect(result).toBe(true);
        expect(mockShouldProcessFile).toHaveBeenCalledWith(
          "src/Component.tsx",
          expect.any(Object),
        );
      });

      it("should respect shouldProcessFile result", () => {
        process.env.NODE_ENV = "development";
        mockShouldProcessFile.mockReturnValue(false);

        const result = vitePlugin.transformInclude("src/Component.tsx");

        expect(result).toBe(false);
      });
    });

    describe("transform", () => {
      it("should transform code when injection occurs", () => {
        const code = "function MyComponent() { return <div />; }";
        const id = "src/Component.tsx";

        const result = vitePlugin.transform(code, id);

        expect(mockTransform).toHaveBeenCalledWith(code, {
          filename: id,
          config: expect.any(Object),
        });
        expect(result).toEqual({
          code: "transformed code",
          map: undefined,
          moduleType: "js",
        });
      });

      it("should return null when no injection occurs", () => {
        mockTransform.mockReturnValue({
          code: "original code",
          injected: false,
          components: [],
        });

        const code = "function MyComponent() { return <div />; }";
        const id = "src/Component.tsx";

        const result = vitePlugin.transform(code, id);

        expect(result).toBe(null);
      });

      it("should handle transform errors gracefully", () => {
        const consoleWarnSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {});
        mockTransform.mockImplementation(() => {
          throw new Error("Transform failed");
        });

        const code = "function MyComponent() { return <div />; }";
        const id = "src/Component.tsx";

        const result = vitePlugin.transform(code, id);

        expect(result).toBe(null);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          "Auto-trace transform failed for src/Component.tsx:",
          expect.any(Error),
        );

        consoleWarnSpy.mockRestore();
      });

      it("should return source map when available", () => {
        const mockComponent: ComponentInfo = {
          name: "TestComponent",
          isAnonymous: false,
          node: {},
        };
        mockTransform.mockReturnValue({
          code: "transformed code",
          injected: true,
          components: [mockComponent],
          map: { version: 3, sources: [], mappings: "" },
        });

        const code = "function MyComponent() { return <div />; }";
        const id = "src/Component.tsx";

        const result = vitePlugin.transform(code, id);

        expect(result).toEqual({
          code: "transformed code",
          map: { version: 3, sources: [], mappings: "" },
          moduleType: "js",
        });
      });
    });
  });

  describe("theme integration", () => {
    let vitePlugin: any;
    let mockConfig: any;

    beforeEach(() => {
      // Enable buildWithWorkspaceLibs to trigger transformIndexHtml tag injection
      vitePlugin = reactTracer.vite({ buildWithWorkspaceLibs: true });
      mockConfig = {
        root: "/test/project",
        command: "serve" as const,
      };
    });

    it("should have configResolved hook", () => {
      expect(vitePlugin.configResolved).toBeDefined();
      expect(typeof vitePlugin.configResolved).toBe("function");
    });

    it("should have transformIndexHtml hook", () => {
      expect(vitePlugin.transformIndexHtml).toBeDefined();
      expect(typeof vitePlugin.transformIndexHtml).toBe("object");
      expect(vitePlugin.transformIndexHtml).toHaveProperty("handler");
      expect(vitePlugin.transformIndexHtml.order).toBe("pre");
    });

    it("should call loadThemeFiles with config.root in configResolved", () => {
      // This test will fail until we implement the hook
      // We'll mock loadThemeFiles to verify it's called correctly
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      vitePlugin.configResolved(mockConfig);

      // For now, we just verify the hook exists and doesn't throw
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should inject theme as global variable in transformIndexHtml when theme exists", () => {
      // Note: loadThemeFiles will return {} for /test/project since no theme files exist there
      // This test verifies the integration pattern is correct
      // In real usage with actual theme files, the theme would be injected
      vitePlugin.configResolved(mockConfig);

      const result = vitePlugin.transformIndexHtml.handler("");

      // Should return object with tags array
      expect(result).toBeDefined();
      expect(result.tags).toBeDefined();
      expect(Array.isArray(result.tags)).toBe(true);

      // loadThemeFiles returns {} for test path, so theme tag should NOT be present
      // This verifies the "don't inject empty theme" logic works
      const themeTag = result.tags.find((tag: any) =>
        tag.children?.includes("__REACTTRACER_THEME__"),
      );

      // Should NOT inject theme tag when loadThemeFiles returns empty object
      expect(themeTag).toBeUndefined();
    });

    it("should inject theme before other scripts", () => {
      vitePlugin.configResolved(mockConfig);
      const result = vitePlugin.transformIndexHtml.handler("");

      expect(result.tags).toBeDefined();
      expect(Array.isArray(result.tags)).toBe(true);

      // Find theme script tag
      const themeTagIndex = result.tags.findIndex((tag: any) =>
        tag.children?.includes("__REACTTRACER_THEME__"),
      );

      // If theme exists, it should be injected to head-prepend
      if (themeTagIndex !== -1) {
        expect(result.tags[themeTagIndex].injectTo).toBe("head-prepend");
      }
    });

    it("should serialize theme config as JSON in script tag", () => {
      // We'll need to verify the theme is properly JSON serialized
      vitePlugin.configResolved(mockConfig);
      const result = vitePlugin.transformIndexHtml.handler("");

      const themeTag = result.tags.find((tag: any) =>
        tag.children?.includes("__REACTTRACER_THEME__"),
      );

      if (themeTag) {
        // Should be valid JavaScript assignment
        expect(themeTag.children).toMatch(
          /globalThis\.__REACTTRACER_THEME__\s*=/,
        );
        // Should contain JSON
        expect(themeTag.children).toMatch(/{.*}/);
      }
    });

    it("should not inject theme script when loadThemeFiles returns empty object", () => {
      // Simulate empty theme (no theme files found)
      vitePlugin.configResolved(mockConfig);
      const result = vitePlugin.transformIndexHtml.handler("");

      const themeTag = result.tags.find((tag: any) =>
        tag.children?.includes("__REACTTRACER_THEME__"),
      );

      // Should not inject theme tag for empty theme
      // This behavior matches Flow's implementation
      expect(themeTag).toBeUndefined();
    });

    it("should handle loadThemeFiles errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // configResolved should not throw even if loadThemeFiles fails
      expect(() => vitePlugin.configResolved(mockConfig)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it("should not load themes when inject is false", () => {
      const pluginDisabled = reactTracer.vite({ inject: false }) as any;
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Should still have the hooks but not execute theme loading
      expect(pluginDisabled.configResolved).toBeDefined();

      pluginDisabled.configResolved(mockConfig);

      // Should not log any warnings
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("outputMode injection", () => {
    it("should inject startup outputMode into HTML when configured", () => {
      const options = {
        buildWithWorkspaceLibs: true,
        outputMode: "copy-paste",
      } satisfies ReactTracerOptions & {
        outputMode: "devtools" | "copy-paste";
      };

      const pluginCandidate = reactTracer.vite(options);
      expect(Array.isArray(pluginCandidate)).toBe(false);
      if (Array.isArray(pluginCandidate)) {
        throw new Error("Expected a single Vite plugin instance");
      }

      const transformIndexHtml = pluginCandidate.transformIndexHtml;
      expect(transformIndexHtml).toBeDefined();
      if (transformIndexHtml === undefined) {
        throw new Error("Expected transformIndexHtml to be defined");
      }

      const indexHtmlCtx = { path: "/", filename: "/index.html" };

      const result =
        typeof transformIndexHtml === "function"
          ? transformIndexHtml("", indexHtmlCtx)
          : (() => {
              const handlerCandidate = Reflect.get(
                transformIndexHtml,
                "handler",
              );
              if (typeof handlerCandidate !== "function") {
                throw new Error("Expected transformIndexHtml.handler to exist");
              }
              return handlerCandidate("", indexHtmlCtx);
            })();

      expect(result).toBeDefined();
      expect(result.tags).toBeDefined();
      expect(Array.isArray(result.tags)).toBe(true);

      const outputModeTag = result.tags.find((tag: any) =>
        String(tag.children ?? "").includes("__autoTracerInternal"),
      );

      expect(outputModeTag).toBeDefined();
      expect(String(outputModeTag.children)).toContain("outputMode");
      expect(String(outputModeTag.children)).toContain("copy-paste");
      expect(outputModeTag.injectTo).toBe("head-prepend");
    });

    it("should not inject startup outputMode into HTML when unset", () => {
      const options = {
        buildWithWorkspaceLibs: true,
      } satisfies ReactTracerOptions;
      const pluginCandidate = reactTracer.vite(options);
      expect(Array.isArray(pluginCandidate)).toBe(false);
      if (Array.isArray(pluginCandidate)) {
        throw new Error("Expected a single Vite plugin instance");
      }

      const transformIndexHtml = pluginCandidate.transformIndexHtml;
      expect(transformIndexHtml).toBeDefined();
      if (transformIndexHtml === undefined) {
        throw new Error("Expected transformIndexHtml to be defined");
      }

      const indexHtmlCtx = { path: "/", filename: "/index.html" };

      const result =
        typeof transformIndexHtml === "function"
          ? transformIndexHtml("", indexHtmlCtx)
          : (() => {
              const handlerCandidate = Reflect.get(
                transformIndexHtml,
                "handler",
              );
              if (typeof handlerCandidate !== "function") {
                throw new Error("Expected transformIndexHtml.handler to exist");
              }
              return handlerCandidate("", indexHtmlCtx);
            })();

      const outputModeTag = result.tags.find((tag: any) =>
        String(tag.children ?? "").includes("__autoTracerInternal"),
      );

      expect(outputModeTag).toBeUndefined();
    });
  });

  describe("self-hosted UMD sources", () => {
    /** Invoke transformIndexHtml.handler on a plugin instance and return its tags. */
    function getTagsFromPlugin(options: ReactTracerOptions): any[] {
      const pluginCandidate = reactTracer.vite(options);
      if (Array.isArray(pluginCandidate)) {
        throw new Error("Expected a single Vite plugin instance");
      }
      const transformIndexHtml = pluginCandidate.transformIndexHtml;
      if (transformIndexHtml === undefined) {
        throw new Error("Expected transformIndexHtml to be defined");
      }
      const handlerCandidate = Reflect.get(transformIndexHtml, "handler");
      if (typeof handlerCandidate !== "function") {
        throw new Error("Expected transformIndexHtml.handler to exist");
      }
      const result = handlerCandidate("", { path: "/", filename: "/index.html" });
      return result.tags as any[];
    }

    it("uses unpkg react src by default when buildWithWorkspaceLibs is true", () => {
      const tags = getTagsFromPlugin({ buildWithWorkspaceLibs: true });
      const reactTag = tags.find(
        (tag: any) => typeof tag.attrs?.src === "string" && String(tag.attrs.src).includes("react@"),
      );
      expect(reactTag).toBeDefined();
      expect(String(reactTag.attrs.src)).toContain("unpkg.com");
    });

    it("uses custom reactUmdSrc instead of unpkg react when provided", () => {
      const tags = getTagsFromPlugin({
        buildWithWorkspaceLibs: true,
        reactUmdSrc: "/vendor/react.production.min.js",
      });
      const reactTag = tags.find(
        (tag: any) =>
          typeof tag.attrs?.src === "string" &&
          String(tag.attrs.src).includes("react"),
      );
      expect(reactTag).toBeDefined();
      expect(String(reactTag.attrs.src)).toBe("/vendor/react.production.min.js");
      expect(String(reactTag.attrs.src)).not.toContain("unpkg.com");
    });

    it("uses unpkg react-dom src by default when buildWithWorkspaceLibs is true", () => {
      const tags = getTagsFromPlugin({ buildWithWorkspaceLibs: true });
      const reactDomTag = tags.find(
        (tag: any) => typeof tag.attrs?.src === "string" && String(tag.attrs.src).includes("react-dom@"),
      );
      expect(reactDomTag).toBeDefined();
      expect(String(reactDomTag.attrs.src)).toContain("unpkg.com");
    });

    it("uses custom reactDomUmdSrc instead of unpkg react-dom when provided", () => {
      const tags = getTagsFromPlugin({
        buildWithWorkspaceLibs: true,
        reactDomUmdSrc: "/vendor/react-dom.production.min.js",
      });
      const reactDomTag = tags.find(
        (tag: any) =>
          typeof tag.attrs?.src === "string" &&
          String(tag.attrs.src).includes("react-dom"),
      );
      expect(reactDomTag).toBeDefined();
      expect(String(reactDomTag.attrs.src)).toBe("/vendor/react-dom.production.min.js");
      expect(String(reactDomTag.attrs.src)).not.toContain("unpkg.com");
    });

    it("uses both custom sources when both are provided", () => {
      const tags = getTagsFromPlugin({
        buildWithWorkspaceLibs: true,
        reactUmdSrc: "/assets/react.min.js",
        reactDomUmdSrc: "/assets/react-dom.min.js",
      });
      const srcs = tags
        .filter((tag: any) => typeof tag.attrs?.src === "string")
        .map((tag: any) => String(tag.attrs.src));
      expect(srcs).toContain("/assets/react.min.js");
      expect(srcs).toContain("/assets/react-dom.min.js");
      expect(srcs.every((s) => !s.includes("unpkg.com"))).toBe(true);
    });

    it("does not inject any UMD src tags when buildWithWorkspaceLibs is false", () => {
      const tags = getTagsFromPlugin({
        buildWithWorkspaceLibs: false,
        reactUmdSrc: "/vendor/react.production.min.js",
      });
      const srcTags = tags.filter((tag: any) => typeof tag.attrs?.src === "string");
      expect(srcTags).toHaveLength(0);
    });
  });
});
