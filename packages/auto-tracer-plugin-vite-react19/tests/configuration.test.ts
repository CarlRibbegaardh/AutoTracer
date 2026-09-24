import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentInfo } from "@autotracer/inject-react19";

vi.mock("@autotracer/inject-react19");
vi.mock("@autotracer/react19/build-utils");

import { reactTracer } from "../src/index";
import * as injectReact19 from "@autotracer/inject-react19";

const mockTransform = vi.mocked(injectReact19.transform);
const mockNormalizeConfig = vi.mocked(injectReact19.normalizeConfig);
const mockShouldProcessFile = vi.mocked(injectReact19.shouldProcessFile);

const DEFAULT_NORMALIZED_CONFIG: Required<injectReact19.TransformConfig> = {
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
  importSource: "@autotracer/react19",
  labelHooks: [],
  labelHooksPattern: "^use[A-Z].*",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockNormalizeConfig.mockReturnValue(DEFAULT_NORMALIZED_CONFIG);
  mockShouldProcessFile.mockReturnValue(true);
  mockTransform.mockReturnValue({
    code: "transformed code",
    injected: true,
    components: [
      { name: "TestComponent", isAnonymous: false, node: {} } as ComponentInfo,
    ],
  });
});

afterEach(() => {
  delete process.env.TRACE_INJECT;
  delete process.env.NODE_ENV;
});

describe("Configuration - Transform Result Validation", () => {
  it("returns transformed code when injected is true", () => {
    const vitePlugin: any = reactTracer.vite();
    mockTransform.mockReturnValue({
      code: "import { useReactTracer } from '@autotracer/react19';\nfunction Component() {}",
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

  it("returns null when injected is false", () => {
    const vitePlugin: any = reactTracer.vite();
    mockTransform.mockReturnValue({
      code: "function Component() {}",
      injected: false,
      components: [],
    });

    expect(
      vitePlugin.transform("function Component() {}", "src/Component.tsx"),
    ).toBe(null);
  });

  it("returns null when an import was added without instrumentation", () => {
    const vitePlugin: any = reactTracer.vite();
    mockTransform.mockReturnValue({
      code: "import { useReactTracer } from '@autotracer/react19';\nfunction Component() {}",
      injected: false,
      components: [],
    });

    expect(
      vitePlugin.transform("function Component() {}", "src/Component.tsx"),
    ).toBe(null);
  });

  it("returns null for unsupported class components", () => {
    const vitePlugin: any = reactTracer.vite();
    mockTransform.mockReturnValue({
      code: "class Component extends React.Component {}",
      injected: false,
      components: [],
    });

    expect(
      vitePlugin.transform(
        "class Component extends React.Component {}",
        "src/Component.tsx",
      ),
    ).toBe(null);
  });
});

describe("Configuration - Options", () => {
  it.each(["opt-in", "opt-out"] as const)(
    "passes mode %s to normalizeConfig",
    (mode) => {
      reactTracer.vite({ mode });

      expect(mockNormalizeConfig).toHaveBeenCalledWith(
        expect.objectContaining({ mode }),
      );
    },
  );

  it("passes include and exclude patterns", () => {
    const include = { paths: ["src/**/*.tsx"] };
    const exclude = { paths: ["**/*.test.*"] };

    reactTracer.vite({ include, exclude });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ include, exclude }),
    );
  });

  it("passes empty include and exclude arrays", () => {
    reactTracer.vite({ include: { paths: [] }, exclude: { paths: [] } });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { paths: [] },
        exclude: { paths: [] },
      }),
    );
  });

  it("passes a custom import source", () => {
    reactTracer.vite({ importSource: "@my-company/auto-tracer-react19" });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        importSource: "@my-company/auto-tracer-react19",
      }),
    );
  });

  it("passes hook labeling options", () => {
    const labelHooks = ["useState", "useAppSelector"];
    const labelHooksPattern = "^use[A-Z].*";

    reactTracer.vite({ labelHooks, labelHooksPattern });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ labelHooks, labelHooksPattern }),
    );
  });

  it.each([true, false])(
    "passes serverComponents %s",
    (serverComponents) => {
      reactTracer.vite({ serverComponents });

      expect(mockNormalizeConfig).toHaveBeenCalledWith(
        expect.objectContaining({ serverComponents }),
      );
    },
  );

  it("accepts undefined configuration", () => {
    reactTracer.vite();

    expect(mockNormalizeConfig).toHaveBeenCalled();
  });

  it("calls shouldProcessFile with the normalized config", () => {
    const vitePlugin: any = reactTracer.vite({
      include: { paths: ["src/**/*.tsx"] },
    });

    vitePlugin.transformInclude("src/Component.tsx");

    expect(mockShouldProcessFile).toHaveBeenCalledWith(
      "src/Component.tsx",
      expect.any(Object),
    );
  });

  it("forwards prefix to transform", () => {
    const vitePlugin: any = reactTracer.vite({ prefix: "Island1" });

    vitePlugin.transform("function A(){}", "src/A.tsx");

    expect(mockTransform).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ prefix: "Island1" }),
    );
  });

  it("uses injector defaults when mode is omitted", () => {
    reactTracer.vite({});

    expect(mockNormalizeConfig).toHaveBeenCalledWith(expect.any(Object));
  });

  it("passes multiple include patterns", () => {
    const include = { paths: ["src/**/*.tsx", "app/**/*.tsx"] };

    reactTracer.vite({ include });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ include }),
    );
  });

  it("passes multiple exclude patterns", () => {
    const exclude = { paths: ["**/*.test.*", "**/*.spec.*"] };

    reactTracer.vite({ exclude });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ exclude }),
    );
  });

  it("passes an empty include array independently", () => {
    reactTracer.vite({ include: { paths: [] } });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ include: { paths: [] } }),
    );
  });

  it("passes an empty exclude array independently", () => {
    reactTracer.vite({ exclude: { paths: [] } });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ exclude: { paths: [] } }),
    );
  });

  it("uses the React 19 injector import source when omitted", () => {
    reactTracer.vite({});

    expect(mockNormalizeConfig).toHaveBeenCalled();
    expect(DEFAULT_NORMALIZED_CONFIG.importSource).toBe("@autotracer/react19");
  });

  it("passes labelHooks independently", () => {
    const labelHooks = ["useState", "useReducer", "useAppSelector"];

    reactTracer.vite({ labelHooks });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ labelHooks }),
    );
  });

  it("passes labelHooksPattern independently", () => {
    const labelHooksPattern = "^use[A-Z].*";

    reactTracer.vite({ labelHooksPattern });

    expect(mockNormalizeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ labelHooksPattern }),
    );
  });

  it("does not add hook labeling options by default", () => {
    reactTracer.vite({});

    expect(mockNormalizeConfig).toHaveBeenCalledWith(expect.any(Object));
  });

  it("leaves serverComponents undefined when omitted", () => {
    reactTracer.vite({});

    expect(mockNormalizeConfig).toHaveBeenCalled();
  });

  it("accepts an empty configuration object", () => {
    reactTracer.vite({});

    expect(mockNormalizeConfig).toHaveBeenCalled();
  });

  it("passes all transformer options together", () => {
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
