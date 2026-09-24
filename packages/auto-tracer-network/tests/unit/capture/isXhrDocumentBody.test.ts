// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { isXhrDocumentBody } from "../../../src/capture/isXhrDocumentBody";

describe("isXhrDocumentBody", () => {
  it("identifies Document bodies", () => {
    const body = document.implementation.createDocument(
      "https://example.test/schema",
      "order",
    );

    expect(isXhrDocumentBody(body)).toBe(true);
  });

  it("rejects standard XHR body values", () => {
    expect(isXhrDocumentBody("payload")).toBe(false);
  });
});
