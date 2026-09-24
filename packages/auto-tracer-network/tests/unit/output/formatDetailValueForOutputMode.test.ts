import { describe, expect, it } from "vitest";
import { formatDetailValueForOutputMode } from "../../../src/output/formatDetailValueForOutputMode";

describe("formatDetailValueForOutputMode", () => {
  it("[NET-OUTPUT-003][NET-OUTPUT-005] returns a detached expandable value in devtools mode", () => {
    const value = { nested: { status: "open" } };
    const formatted = formatDetailValueForOutputMode(value, "devtools");

    value.nested.status = "changed";

    expect(formatted).toEqual({ nested: { status: "open" } });
    expect(formatted).not.toBe(value);
  });

  it("[NET-OUTPUT-004..006][NET-OUTCOME-009] creates stable copy-paste JSON without error stacks", () => {
    const value = {
      set: new Set(["second", "first"]),
      map: new Map([["answer", 42]]),
      error: Object.assign(new TypeError("failed"), { stack: "hidden" }),
      big: 12n,
      alpha: true,
    };

    expect(formatDetailValueForOutputMode(value, "copy-paste")).toBe(
      '{"alpha":true,"big":"12n","error":{"message":"failed","name":"TypeError"},"map":[["answer",42]],"set":["second","first"]}',
    );
  });

  it("[NET-OUTPUT-004] marks circular values and preserves primitives", () => {
    const circular: { readonly name: string; self?: unknown } = {
      name: "root",
    };
    circular.self = circular;

    expect(formatDetailValueForOutputMode(circular, "copy-paste")).toBe(
      '{"name":"root","self":"[Circular]"}',
    );
    expect(formatDetailValueForOutputMode("visible", "copy-paste")).toBe(
      "visible",
    );
  });
});
