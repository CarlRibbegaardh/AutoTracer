import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolve } from "path";

const readFileSyncMock = vi.hoisted(() => vi.fn());

vi.mock("@autotracer/inject-react19", () => ({
  transform: vi.fn(),
  normalizeConfig: vi.fn(),
  shouldProcessFile: vi.fn(),
}));

vi.mock("@autotracer/react19/build-utils", () => ({
  loadThemeFiles: vi.fn(),
}));

vi.mock("fs", () => ({
  default: { readFileSync: readFileSyncMock },
  readFileSync: readFileSyncMock,
}));

import { reactTracer } from "../src/index";
import * as injectReact19 from "@autotracer/inject-react19";

const mockNormalizeConfig = vi.mocked(injectReact19.normalizeConfig);

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
  readFileSyncMock.mockReset();
  mockNormalizeConfig.mockReturnValue(DEFAULT_CONFIG);
});

describe("generateBundle hook", () => {
  it("emits the React 19 tracer UMD file when buildWithWorkspaceLibs is true", () => {
    readFileSyncMock.mockReturnValue("/* umd content */" as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const plugin = reactTracer.vite({ buildWithWorkspaceLibs: true }) as any;
    plugin.emitFile = vi.fn();

    plugin.generateBundle();

    expect(readFileSyncMock).toHaveBeenCalledWith(
      resolve(
        process.cwd(),
        "node_modules/@autotracer/react19/dist/index.umd.js",
      ),
      "utf-8",
    );
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

  it("logs an error without throwing when readFileSync fails", () => {
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
