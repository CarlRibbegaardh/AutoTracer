/**
 * @file Tests for fingerprintReactElement
 */

import { describe, expect, it } from "vitest";
import { fingerprintReactElement } from "../../../../../../src/lib/functions/normalization/fingerprinting/fingerprintReactElement";

describe("fingerprintReactElement", () => {
  it("should return '[ReactElement]' for React element", () => {
    const element = {
      $$typeof: Symbol.for("react.element"),
      type: "div",
      props: { children: "Hello" },
    };

    const result = fingerprintReactElement(element);

    expect(result).toBe("[ReactElement]");
  });

  it("should return '[ReactElement]' for React element with nested props", () => {
    const element = {
      $$typeof: Symbol.for("react.element"),
      type: "span",
      props: {
        nested: {
          deep: {
            veryDeep: "Should not traverse this",
          },
        },
      },
    };

    const result = fingerprintReactElement(element);

    expect(result).toBe("[ReactElement]");
  });

  it("should return null for plain object without $$typeof", () => {
    const notElement = {
      type: "div",
      props: {},
    };

    const result = fingerprintReactElement(notElement);

    expect(result).toBeNull();
  });

  it("should return null for object with non-symbol $$typeof", () => {
    const notElement = {
      $$typeof: "not-a-symbol",
      type: "div",
    };

    const result = fingerprintReactElement(notElement);

    expect(result).toBeNull();
  });

  it("should return null for object with wrong symbol", () => {
    const notElement = {
      $$typeof: Symbol.for("something.else"),
      type: "div",
    };

    const result = fingerprintReactElement(notElement);

    expect(result).toBeNull();
  });

  it("should return null for primitives", () => {
    expect(fingerprintReactElement("string")).toBeNull();
    expect(fingerprintReactElement(42)).toBeNull();
    expect(fingerprintReactElement(true)).toBeNull();
    expect(fingerprintReactElement(null)).toBeNull();
    expect(fingerprintReactElement(undefined)).toBeNull();
  });

  it("should return null for arrays", () => {
    const result = fingerprintReactElement([1, 2, 3]);

    expect(result).toBeNull();
  });
});
