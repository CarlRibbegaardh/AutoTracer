import { describe, expect, it } from "vitest";
import { createFormDataBodySnapshot } from "../../../src/body/createFormDataBodySnapshot";

describe("createFormDataBodySnapshot", () => {
  it("[NET-BODY-007] preserves ordered text fields and duplicate names", () => {
    const formData = new FormData();
    formData.append("tag", "first");
    formData.append("tag", "second");

    expect(createFormDataBodySnapshot(formData)).toEqual([
      { kind: "text", name: "tag", value: "first" },
      { kind: "text", name: "tag", value: "second" },
    ]);
  });

  it("[NET-BODY-008] captures file metadata without file contents", () => {
    const formData = new FormData();
    formData.append(
      "attachment",
      new File(["data"], "trace.txt", { type: "text/plain" }),
    );

    expect(createFormDataBodySnapshot(formData)).toEqual([
      {
        kind: "file",
        name: "attachment",
        fileName: "trace.txt",
        contentType: "text/plain",
        byteSize: 4,
      },
    ]);
  });
});
