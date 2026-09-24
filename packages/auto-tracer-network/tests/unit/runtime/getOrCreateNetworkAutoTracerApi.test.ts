import { describe, expect, it, vi } from "vitest";
import { getOrCreateNetworkAutoTracerApi } from "../../../src/runtime/getOrCreateNetworkAutoTracerApi";

describe("getOrCreateNetworkAutoTracerApi", () => {
  it("[NET-OUTPUT-001..002] creates live shared output-mode controls", () => {
    const realm: {
      autoTracer?: {
        getOutputMode: () => "devtools" | "copy-paste";
        setOutputMode: (mode: "devtools" | "copy-paste") => void;
      };
    } = {};

    const api = getOrCreateNetworkAutoTracerApi(realm);

    expect(api.getOutputMode()).toBe("devtools");
    api.setOutputMode("copy-paste");
    expect(api.getOutputMode()).toBe("copy-paste");
    expect(realm.autoTracer).toBe(api);
  });

  it("[NET-INSTALL-002] reuses compatible controls installed by another tracer", () => {
    const existing = {
      getOutputMode: vi.fn<() => "devtools" | "copy-paste">(
        () => "copy-paste",
      ),
      setOutputMode: vi.fn(),
      reactTracer: { start: vi.fn() },
    };
    const realm = { autoTracer: existing };

    const api = getOrCreateNetworkAutoTracerApi(realm);

    expect(api).toBe(existing);
    expect(api.getOutputMode()).toBe("copy-paste");
    expect(realm.autoTracer.reactTracer).toBe(existing.reactTracer);
  });

  it("[NET-OUTPUT-001..002] reuses shared state and notifies its subscribers", () => {
    const subscriber = vi.fn();
    const realm: {
      autoTracer?: unknown;
      __autoTracerInternal: {
        outputMode: "devtools" | "copy-paste";
        subscribers: Array<(mode: "devtools" | "copy-paste") => void>;
      };
    } = {
      autoTracer: null,
      __autoTracerInternal: {
        outputMode: "copy-paste",
        subscribers: [subscriber],
      },
    };

    const api = getOrCreateNetworkAutoTracerApi(realm);
    api.setOutputMode("devtools");

    expect(api.getOutputMode()).toBe("devtools");
    expect(subscriber).toHaveBeenCalledExactlyOnceWith("devtools");
  });

  it("[NET-INSTALL-002] replaces incompatible shared API candidates", () => {
    const incompatibleCandidates: readonly unknown[] = [
      {},
      { getOutputMode: "devtools" },
      { getOutputMode: () => "devtools" },
      { getOutputMode: () => "devtools", setOutputMode: "invalid" },
    ];

    incompatibleCandidates.forEach((autoTracer) => {
      const realm = { autoTracer };
      const api = getOrCreateNetworkAutoTracerApi(realm);

      expect(realm.autoTracer).toBe(api);
    });
  });
});
