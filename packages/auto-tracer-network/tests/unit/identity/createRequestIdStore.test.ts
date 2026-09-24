import { describe, expect, it } from "vitest";
import { createRequestIdStore } from "../../../src/identity/createRequestIdStore";

describe("createRequestIdStore", () => {
  it("[NET-ID-004] begins a clean session at request ID 1", () => {
    const store = createRequestIdStore();

    expect(store.getNextRequestId()).toBe(1);
  });

  it("[NET-ID-005] continues the request sequence when a draining session resumes", () => {
    const store = createRequestIdStore();

    expect(store.getNextRequestId()).toBe(1);
    expect(store.getNextRequestId()).toBe(2);
  });

  it("[NET-ID-006] resets the request sequence for a clean session", () => {
    const store = createRequestIdStore();

    store.getNextRequestId();
    store.getNextRequestId();
    store.resetRequestIds();

    expect(store.getNextRequestId()).toBe(1);
  });
});
