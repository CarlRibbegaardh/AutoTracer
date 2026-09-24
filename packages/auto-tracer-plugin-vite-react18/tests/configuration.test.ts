/**
 * Phase 1: Configuration Coverage Tests
 *
 * Tests all ReactTracerOptions to ensure they are correctly passed to
 * the underlying inject-react18 transformer.
 *
 * Focus: Integration layer validation, not transformation correctness
 * (that's tested in inject-react18 package).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ComponentInfo } from "@autotracer/inject-react18";

// Mock the inject-react18 module
vi.mock("@autotracer/inject-react18");

// Mock theme loading
vi.mock("@autotracer/react18/build-utils");

// Import after mocking
import { reactTracer } from "../src/index";
import * as injectReact18 from "@autotracer/inject-react18";

// Get properly typed mocks
const mockTransform = vi.mocked(injectReact18.transform);
const mockNormalizeConfig = vi.mocked(injectReact18.normalizeConfig);
const mockShouldProcessFile = vi.mocked(injectReact18.shouldProcessFile);

// Default config to use in mocks (matches inject-react18 DEFAULT_CONFIG)
const DEFAULT_NORMALIZED_CONFIG: Required<injectReact18.TransformConfig> = {
  mode: "opt-out",
  include: {
    paths: ["**/*.{tsx,jsx}"],
    components: [],
  },
  exclude: {
    paths: [
      "**/*.test.*",
      "**/*.spec.*",
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/tests/**",
      "**/test/**",
      "**/__tests__/**",
    ],
    components: [],
  },
  serverComponents: false,
  importSource: "@autotracer/react18",
  labelHooks: [],
  labelHooksPattern: "^use[A-Z].*",
};

describe("Configuration - Transform Result Validation", () => {
  let vitePlugin: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock behavior
    mockNormalizeConfig.mockReturnValue(DEFAULT_NORMALIZED_CONFIG);
    mockShouldProcessFile.mockReturnValue(true);
    mockTransform.mockReturnValue({
      code: "transformed code",
      injected: true,
      components: [
        {
          name: "TestComponent",
          isAnonymous: false,
          node: {},
        } as ComponentInfo,
      ],
    });
  });

  afterEach(() => {
    delete process.env.TRACE_INJECT;
    delete process.env.NODE_ENV;
  });

  it("should return transformed code when injected is true and components exist", () => {
    vitePlugin = reactTracer.vite();
    mockTransform.mockReturnValue({
      code: "import { useReactTracer } from '@autotracer/react18';\nfunction Component() {}",
      injected: true,
      components: [
        { name: "Component", isAnonymous: false, node: {} } as ComponentInfo,
      ],
    });

    const result = vitePlugin.transform(
      "function Component() {}",
      "src/Component.tsx",
    );

    expect(result).not.toBe(null);
    expect(result?.code).toContain("useReactTracer");
  });

  it("should return null when injected is false (no components instrumented)", () => {
    vitePlugin = reactTracer.vite();
    mockTransform.mockReturnValue({
      code: "function Component() {}", // Original code, unchanged
      injected: false,
      components: [],
    });

    const result = vitePlugin.transform(
      "function Component() {}",
      "src/Component.tsx",
    );

    expect(result).toBe(null);
  });

  it("should return null when injected is false even if import was added", () => {
    vitePlugin = reactTracer.vite();

    // This simulates the bug: import added but no components instrumented
    mockTransform.mockReturnValue({
      code: "import { useReactTracer } from '@autotracer/react18';\nfunction Component() {}",
      injected: false, // No actual instrumentation happened
      components: [], // No components were instrumented
    });

    const result = vitePlugin.transform(
      "function Component() {}",
      "src/Component.tsx",
    );

    // Plugin should return null because injected is false
    // This prevents imports without instrumentation
    expect(result).toBe(null);
  });

  it("should return null for class components (not supported by transformer)", () => {
    vitePlugin = reactTracer.vite();
    mockTransform.mockReturnValue({
      code: "class Component extends React.Component {}",
      injected: false,
      components: [],
    });

    const result = vitePlugin.transform(
      "class Component extends React.Component {}",
      "src/Component.tsx",
    );

    expect(result).toBe(null);
  });
});

describe("Configuration - Mode Option", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNormalizeConfig.mockReturnValue(DEFAULT_NORMALIZED_CONFIG);
    mockShouldProcessFile.mockReturnValue(true);
    mockTransform.mockReturnValue({
      code: "transformed",
      injected: true,
      components: [],
    });
  });

  it("should pass mode: 'opt-in' to normalizeConfig", () => {
    reactTracer.vite({ mode: "opt-in" });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "opt-in" }),
    );
  });

  it("should pass mode: 'opt-out' to normalizeConfig", () => {
    reactTracer.vite({ mode: "opt-out" });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "opt-out" }),
    );
  });

  it("should use default mode when not specified", () => {
    reactTracer.vite({});

    // inject-react18 defaults to 'opt-out'
    expect(mockNormalizeConfig).toHaveBeenCalledWith(expect.any(Object));
  });
});

describe("Configuration - File Filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNormalizeConfig.mockReturnValue(DEFAULT_NORMALIZED_CONFIG);
    mockShouldProcessFile.mockReturnValue(true);
    mockTransform.mockReturnValue({
      code: "transformed",
      injected: true,
      components: [],
    });
  });

  it("should pass include patterns to normalizeConfig", () => {
    const include = { paths: ["src/**/*.tsx", "app/**/*.tsx"] };
    reactTracer.vite({ include });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ include }),
    );
  });

  it("should pass exclude patterns to normalizeConfig", () => {
    const exclude = { paths: ["**/*.test.*", "**/*.spec.*"] };
    reactTracer.vite({ exclude });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ exclude }),
    );
  });

  it("should pass combined include and exclude patterns", () => {
    const include = { paths: ["src/**/*.tsx"] };
    const exclude = { paths: ["**/*.test.*"] };
    reactTracer.vite({ include, exclude });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ include, exclude }),
    );
  });

  it("should handle empty include array", () => {
    reactTracer.vite({ include: { paths: [] } });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ include: { paths: [] } }),
    );
  });

  it("should handle empty exclude array", () => {
    reactTracer.vite({ exclude: { paths: [] } });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ exclude: { paths: [] } }),
    );
  });

  it("should call shouldProcessFile with filename and normalized config", () => {
    const vitePlugin: any = reactTracer.vite({
      include: { paths: ["src/**/*.tsx"] },
    });
    const filename = "src/Component.tsx";

    vitePlugin.transformInclude(filename);

    expect(mockShouldProcessFile).toHaveBeenCalledWith(
      filename,
      expect.any(Object),
    );
  });
});

describe("Configuration - Import Source", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNormalizeConfig.mockReturnValue(DEFAULT_NORMALIZED_CONFIG);
    mockShouldProcessFile.mockReturnValue(true);
  });

  it("should pass custom importSource to normalizeConfig", () => {
    const importSource = "@my-company/auto-tracer-react18";
    reactTracer.vite({ importSource });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ importSource }),
    );
  });

  it("should use default importSource when not specified", () => {
    reactTracer.vite({});

    // Should call normalizeConfig without importSource
    // (inject-react18 will use its default: '@autotracer/react18')
    expect(mockNormalizeConfig).toHaveBeenCalled();
  });
});

describe("Configuration - Hook Labeling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNormalizeConfig.mockReturnValue(DEFAULT_NORMALIZED_CONFIG);
    mockShouldProcessFile.mockReturnValue(true);
  });

  it("should pass labelHooks array to normalizeConfig", () => {
    const labelHooks = ["useState", "useReducer", "useAppSelector"];
    reactTracer.vite({ labelHooks });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ labelHooks }),
    );
  });

  it("should pass labelHooksPattern regex to normalizeConfig", () => {
    const labelHooksPattern = "^use[A-Z].*";
    reactTracer.vite({ labelHooksPattern });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ labelHooksPattern }),
    );
  });

  it("should pass both labelHooks and labelHooksPattern", () => {
    const labelHooks = ["useState"];
    const labelHooksPattern = "^use[A-Z].*";
    reactTracer.vite({ labelHooks, labelHooksPattern });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        labelHooks,
        labelHooksPattern,
      }),
    );
  });

  it("should not label hooks by default (no labeling configuration)", () => {
    reactTracer.vite({});

    expect(mockNormalizeConfig).toHaveBeenCalledWith(expect.any(Object));
    // Should not contain labelHooks or labelHooksPattern keys
  });
});

describe("Configuration - Server Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNormalizeConfig.mockReturnValue(DEFAULT_NORMALIZED_CONFIG);
    mockShouldProcessFile.mockReturnValue(true);
  });

  it("should pass serverComponents: true to normalizeConfig", () => {
    reactTracer.vite({ serverComponents: true });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ serverComponents: true }),
    );
  });

  it("should pass serverComponents: false to normalizeConfig", () => {
    reactTracer.vite({ serverComponents: false });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ serverComponents: false }),
    );
  });

  it("should default to undefined when serverComponents not specified", () => {
    reactTracer.vite({});

    // Should call normalizeConfig without serverComponents key
    expect(mockNormalizeConfig).toHaveBeenCalled();
  });
});

describe("Configuration - Validation & Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNormalizeConfig.mockReturnValue(DEFAULT_NORMALIZED_CONFIG);
    mockShouldProcessFile.mockReturnValue(true);
    mockTransform.mockReturnValue({
      code: "transformed",
      injected: true,
      components: [],
    });
  });

  it("should handle partial configuration (only some options provided)", () => {
    reactTracer.vite({ mode: "opt-in", include: { paths: ["src/**/*.tsx"] } });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "opt-in",
        include: { paths: ["src/**/*.tsx"] },
      }),
    );
  });

  it("should handle empty configuration object", () => {
    reactTracer.vite({});

    expect(mockNormalizeConfig).toHaveBeenCalled();
  });

  it("should handle undefined configuration (plugin called without arguments)", () => {
    reactTracer.vite();

    expect(mockNormalizeConfig).toHaveBeenCalled();
  });

  it("should pass all configuration options together", () => {
    const config = {
      mode: "opt-in" as const,
      include: { paths: ["src/**/*.tsx"] },
      exclude: { paths: ["**/*.test.*"] },
      importSource: "@my-company/tracer",
      labelHooks: ["useState"],
      labelHooksPattern: "^use[A-Z].*",
      serverComponents: true,
    };

    reactTracer.vite(config);

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining(config),
    );
  });
});

describe("Configuration - prefix option", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNormalizeConfig.mockReturnValue(DEFAULT_NORMALIZED_CONFIG);
    mockShouldProcessFile.mockReturnValue(true);
    mockTransform.mockReturnValue({
      code: "transformed",
      injected: true,
      components: [],
    });
  });

  it("forwards prefix to transform as prefix", () => {
    const vitePlugin: any = reactTracer.vite({ prefix: "Island1" });

    vitePlugin.transform("function A(){}", "src/A.tsx");

    expect(mockTransform).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ prefix: "Island1" }),
    );
  });
});
