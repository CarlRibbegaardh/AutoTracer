/**
 * @file Tests for fingerprintDOMObject
 */

import { describe, expect, it } from "vitest";
import { fingerprintDOMObject } from "../../../../../../src/lib/functions/normalization/fingerprinting/fingerprintDOMObject";

describe("fingerprintDOMObject", () => {
  it("should return null for plain objects", () => {
    const plainObj = { a: 1, b: 2 };

    const result = fingerprintDOMObject(plainObj);

    expect(result).toBeNull();
  });

  it("should return null for arrays", () => {
    const result = fingerprintDOMObject([1, 2, 3]);

    expect(result).toBeNull();
  });

  it("should return null for primitives", () => {
    expect(fingerprintDOMObject("string")).toBeNull();
    expect(fingerprintDOMObject(42)).toBeNull();
    expect(fingerprintDOMObject(true)).toBeNull();
    expect(fingerprintDOMObject(null)).toBeNull();
    expect(fingerprintDOMObject(undefined)).toBeNull();
  });

  it("should return null for Date objects", () => {
    const date = new Date();

    const result = fingerprintDOMObject(date);

    expect(result).toBeNull();
  });

  it("should return null for RegExp objects", () => {
    const regex = /test/;

    const result = fingerprintDOMObject(regex);

    expect(result).toBeNull();
  });

  it("should return null for Error objects", () => {
    const error = new Error("test");

    const result = fingerprintDOMObject(error);

    expect(result).toBeNull();
  });

  it("should return fingerprint for object with HTML constructor name", () => {
    const domLike = {
      constructor: { name: "HTMLDivElement" },
    };
    Object.setPrototypeOf(domLike, {
      constructor: { name: "HTMLDivElement" },
    });

    const result = fingerprintDOMObject(domLike);

    expect(result).toBe("[HTMLDivElement]");
  });

  it("should return fingerprint for object with Element constructor name", () => {
    const domLike = {
      constructor: { name: "CustomElement" },
    };
    Object.setPrototypeOf(domLike, {
      constructor: { name: "CustomElement" },
    });

    const result = fingerprintDOMObject(domLike);

    expect(result).toBe("[CustomElement]");
  });

  it("should return fingerprint for Window-like object", () => {
    const windowLike = {
      constructor: { name: "Window" },
    };
    Object.setPrototypeOf(windowLike, {
      constructor: { name: "Window" },
    });

    const result = fingerprintDOMObject(windowLike);

    expect(result).toBe("[Window]");
  });

  it("should return fingerprint for Document-like object", () => {
    const documentLike = {
      constructor: { name: "Document" },
    };
    Object.setPrototypeOf(documentLike, {
      constructor: { name: "Document" },
    });

    const result = fingerprintDOMObject(documentLike);

    expect(result).toBe("[Document]");
  });
});
