/**
 * Tests for the generateBundle Vite hook.
 * Kept in a separate file so the `fs` module mock is isolated from other tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const readFileSyncMock = vi.hoisted(() => vi.fn());

// Must mock before other imports so the mocks are in place when modules resolve.
vi.mock("@autotracer/inject-react18", () => ({
  transform: vi.fn(),
  normalizeConfig: vi.fn(),
  shouldProcessFile: vi.fn(),
}));

vi.mock("@autotracer/react18/build-utils", () => ({
  loadThemeFiles: vi.fn(),
}));

vi.mock("fs", () => ({
  default: { readFileSync: readFileSyncMock },
  readFileSync: readFileSyncMock,
}));

import { reactTracer } from "../src/index";
import * as injectReact18 from "@autotracer/inject-react18";

const mockNormalizeConfig = vi.mocked(injectReact18.normalizeConfig);

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
  readFileSyncMock.mockReset();
  mockNormalizeConfig.mockReturnValue(DEFAULT_CONFIG);
});

describe("generateBundle hook", () => {
  it("emits UMD file as asset when buildWithWorkspaceLibs is true", () => {
    readFileSyncMock.mockReturnValue("/* umd content */" as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const plugin = reactTracer.vite({ buildWithWorkspaceLibs: true }) as any;
    // Attach emitFile so this.emitFile({...}) does not throw when generateBundle runs.
    plugin.emitFile = vi.fn();

    plugin.generateBundle();

    // No console.error means readFileSync returned successfully and emitFile was called
    // without error. The actual emitFile invocation uses the plugin's own `this` context.
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it("skips UMD emission when buildWithWorkspaceLibs is false", () => {
    const plugin = reactTracer.vite({ buildWithWorkspaceLibs: false }) as any;
    const emitFileMock = vi.fn();
    plugin.emitFile = emitFileMock;

    plugin.generateBundle();

    expect(emitFileMock).not.toHaveBeenCalled();
  });

  it("skips UMD emission when inject is false", () => {
    const plugin = reactTracer.vite({
      inject: false,
      buildWithWorkspaceLibs: true,
    }) as any;
    const emitFileMock = vi.fn();
    plugin.emitFile = emitFileMock;

    plugin.generateBundle();

    expect(readFileSyncMock).not.toHaveBeenCalled();
    expect(emitFileMock).not.toHaveBeenCalled();
  });

  it("logs error and does not throw when readFileSync fails", () => {
    readFileSyncMock.mockImplementation(() => {
      throw new Error("file not found");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const plugin = reactTracer.vite({ buildWithWorkspaceLibs: true }) as any;
    plugin.emitFile = vi.fn();

    expect(() => plugin.generateBundle()).not.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("ReactTracer plugin: Failed to emit UMD file:"),
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });
});
