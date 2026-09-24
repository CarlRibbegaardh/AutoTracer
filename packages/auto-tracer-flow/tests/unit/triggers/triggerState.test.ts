import { describe, it, expect, beforeEach } from "vitest";
import {
  isTriggeredByStart,
  setTriggeredByStart,
  resetTriggerState,
} from "../../../src/lib/triggers/triggerState";

describe("triggerState (Flow)", () => {
  beforeEach(() => {
    // Reset state before each test
    resetTriggerState();
  });

  describe("isTriggeredByStart", () => {
    it("should return false initially", () => {
      expect(isTriggeredByStart()).toBe(false);
    });

    it("should return true after being set to true", () => {
      setTriggeredByStart(true);
      expect(isTriggeredByStart()).toBe(true);
    });

    it("should return false after being set to false", () => {
      setTriggeredByStart(true);
      setTriggeredByStart(false);
      expect(isTriggeredByStart()).toBe(false);
    });
  });

  describe("setTriggeredByStart", () => {
    it("should set state to true", () => {
      setTriggeredByStart(true);
      expect(isTriggeredByStart()).toBe(true);
    });

    it("should set state to false", () => {
      setTriggeredByStart(true);
      setTriggeredByStart(false);
      expect(isTriggeredByStart()).toBe(false);
    });

    it("should allow toggling state multiple times", () => {
      setTriggeredByStart(true);
      expect(isTriggeredByStart()).toBe(true);

      setTriggeredByStart(false);
      expect(isTriggeredByStart()).toBe(false);

      setTriggeredByStart(true);
      expect(isTriggeredByStart()).toBe(true);
    });
  });

  describe("resetTriggerState", () => {
    it("should reset state to false", () => {
      setTriggeredByStart(true);
      resetTriggerState();
      expect(isTriggeredByStart()).toBe(false);
    });

    it("should be idempotent when state is already false", () => {
      resetTriggerState();
      expect(isTriggeredByStart()).toBe(false);
      resetTriggerState();
      expect(isTriggeredByStart()).toBe(false);
    });

    it("should reset after multiple state changes", () => {
      setTriggeredByStart(true);
      setTriggeredByStart(false);
      setTriggeredByStart(true);
      resetTriggerState();
      expect(isTriggeredByStart()).toBe(false);
    });
  });

  describe("state persistence across calls", () => {
    it("should maintain state between multiple checks", () => {
      setTriggeredByStart(true);
      expect(isTriggeredByStart()).toBe(true);
      expect(isTriggeredByStart()).toBe(true);
      expect(isTriggeredByStart()).toBe(true);
    });

    it("should maintain state until explicitly changed", () => {
      setTriggeredByStart(true);
      // Simulate time passing
      for (let i = 0; i < 10; i++) {
        expect(isTriggeredByStart()).toBe(true);
      }
      // State should still be true
      expect(isTriggeredByStart()).toBe(true);
    });
  });
});
