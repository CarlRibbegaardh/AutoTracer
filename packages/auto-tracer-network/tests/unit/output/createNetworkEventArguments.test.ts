import { describe, expect, it } from "vitest";
import type { RedirectCompletionEvent } from "../../../src/events/RedirectCompletionEvent";
import type { StructuredDetailEvent } from "../../../src/events/StructuredDetailEvent";
import type { TokenizedEvent } from "../../../src/events/TokenizedEvent";
import { createCopyPasteEventArguments } from "../../../src/output/createCopyPasteEventArguments";
import { createCopyPasteRedirectArguments } from "../../../src/output/createCopyPasteRedirectArguments";
import { createCopyPasteStructuredDetailArguments } from "../../../src/output/createCopyPasteStructuredDetailArguments";
import { createDevToolsEventArguments } from "../../../src/output/createDevToolsEventArguments";
import { createDevToolsRedirectArguments } from "../../../src/output/createDevToolsRedirectArguments";
import { createDevToolsStructuredDetailArguments } from "../../../src/output/createDevToolsStructuredDetailArguments";
import { createNetworkEventArguments } from "../../../src/output/createNetworkEventArguments";
import { defaultNetworkTheme } from "../../../src/theme/defaultNetworkTheme";

describe("createNetworkEventArguments", () => {
  it("[NET-OUTPUT-003..008] selects the renderer for every event kind and output mode", () => {
    const tokenEvent: TokenizedEvent = {
      tokens: [{ role: "plain", text: "token" }],
    };
    const detailEvent: StructuredDetailEvent = {
      kind: "structured-detail",
      tokens: [{ role: "label", text: "detail: " }],
      value: { visible: true },
    };
    const redirectEvent: RedirectCompletionEvent = {
      kind: "redirect-completion",
      completionTokens: [{ role: "plain", text: "redirect" }],
      requestedTokens: [{ role: "plain", text: "requested" }],
      finalTokens: [{ role: "plain", text: "final" }],
    };
    const devTools = {
      outputMode: "devtools" as const,
      theme: defaultNetworkTheme,
      colorMode: "dark" as const,
    };
    const copyPaste = { ...devTools, outputMode: "copy-paste" as const };

    expect(createNetworkEventArguments(tokenEvent, devTools)).toEqual(
      createDevToolsEventArguments(tokenEvent, defaultNetworkTheme, "dark"),
    );
    expect(createNetworkEventArguments(detailEvent, devTools)).toEqual(
      createDevToolsStructuredDetailArguments(
        detailEvent,
        defaultNetworkTheme,
        "dark",
      ),
    );
    expect(createNetworkEventArguments(redirectEvent, devTools)).toEqual(
      createDevToolsRedirectArguments(
        redirectEvent,
        defaultNetworkTheme,
        "dark",
      ),
    );
    expect(createNetworkEventArguments(tokenEvent, copyPaste)).toEqual(
      createCopyPasteEventArguments(tokenEvent),
    );
    expect(createNetworkEventArguments(detailEvent, copyPaste)).toEqual(
      createCopyPasteStructuredDetailArguments(detailEvent),
    );
    expect(createNetworkEventArguments(redirectEvent, copyPaste)).toEqual(
      createCopyPasteRedirectArguments(redirectEvent),
    );
  });
});
