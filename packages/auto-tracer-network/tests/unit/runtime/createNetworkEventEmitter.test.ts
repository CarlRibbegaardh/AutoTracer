import { describe, expect, it, vi } from "vitest";
import { createRequestStartEvent } from "../../../src/events/createRequestStartEvent";
import { createDevToolsEventArguments } from "../../../src/output/createDevToolsEventArguments";
import { createCopyPasteEventArguments } from "../../../src/output/createCopyPasteEventArguments";
import { createNetworkEventEmitter } from "../../../src/runtime/createNetworkEventEmitter";
import { defaultNetworkTheme } from "../../../src/theme/defaultNetworkTheme";

describe("createNetworkEventEmitter", () => {
  it("[NET-OUTPUT-001..002,006..008] renders each event from live shared output settings at normal level", () => {
    const event = createRequestStartEvent(1, "GET", "/items");
    let outputMode: "devtools" | "copy-paste" = "devtools";
    const log = vi.fn();
    const emit = createNetworkEventEmitter(
      () => ({
        outputMode,
        theme: defaultNetworkTheme,
        colorMode: "dark",
      }),
      log,
    );

    emit(event);
    outputMode = "copy-paste";
    emit(event);

    expect(log.mock.calls).toEqual([
      [...createDevToolsEventArguments(event, defaultNetworkTheme, "dark")],
      [...createCopyPasteEventArguments(event)],
    ]);
  });
});
