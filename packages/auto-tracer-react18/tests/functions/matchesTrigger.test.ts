import { describe, expect, it } from "vitest";
import { matchesTrigger } from "../../src/lib/functions/triggers/matchesTrigger";

describe("matchesTrigger", () => {
  describe("null and undefined patterns", () => {
    it("should return false for null pattern", () => {
      expect(matchesTrigger("MyComponent", null)).toBe(false);
    });

    it("should return false for undefined pattern", () => {
      expect(matchesTrigger("MyComponent", undefined as unknown as null)).toBe(
        false
      );
    });
  });

  describe("empty and whitespace patterns", () => {
    it("should return false for empty string pattern", () => {
      expect(matchesTrigger("MyComponent", "")).toBe(false);
    });

    it("should return false for whitespace-only pattern", () => {
      expect(matchesTrigger("MyComponent", "   ")).toBe(false);
    });

    it("should return false for tab-only pattern", () => {
      expect(matchesTrigger("MyComponent", "\t")).toBe(false);
    });

    it("should return false for newline pattern", () => {
      expect(matchesTrigger("MyComponent", "\n")).toBe(false);
    });
  });

  describe("exact matching", () => {
    it("should match exact component name", () => {
      expect(matchesTrigger("MyComponent", "MyComponent")).toBe(true);
    });

    it("should not match different component name", () => {
      expect(matchesTrigger("MyComponent", "OtherComponent")).toBe(false);
    });

    it("should be case-sensitive", () => {
      expect(matchesTrigger("MyComponent", "mycomponent")).toBe(false);
      expect(matchesTrigger("mycomponent", "MyComponent")).toBe(false);
    });

    it("should match component with leading/trailing whitespace in pattern", () => {
      expect(matchesTrigger("MyComponent", "  MyComponent  ")).toBe(true);
    });
  });

  describe("glob pattern matching", () => {
    describe("* wildcard", () => {
      it("should match components starting with pattern", () => {
        expect(matchesTrigger("MyComponent", "My*")).toBe(true);
        expect(matchesTrigger("MyOtherComponent", "My*")).toBe(true);
      });

      it("should match components ending with pattern", () => {
        expect(matchesTrigger("MyComponent", "*Component")).toBe(true);
        expect(matchesTrigger("OtherComponent", "*Component")).toBe(true);
      });

      it("should match components containing pattern", () => {
        expect(matchesTrigger("MyComponent", "*Comp*")).toBe(true);
        expect(matchesTrigger("CustomCompWrapper", "*Comp*")).toBe(true);
      });

      it("should match any component with *", () => {
        expect(matchesTrigger("MyComponent", "*")).toBe(true);
        expect(matchesTrigger("AnyComponent", "*")).toBe(true);
        expect(matchesTrigger("A", "*")).toBe(true);
      });

      it("should not match when pattern does not match", () => {
        expect(matchesTrigger("MyComponent", "Other*")).toBe(false);
        expect(matchesTrigger("MyComponent", "*Widget")).toBe(false);
      });
    });

    describe("? wildcard", () => {
      it("should match single character", () => {
        expect(matchesTrigger("MyComponent", "M?Component")).toBe(true);
        expect(matchesTrigger("MxComponent", "M?Component")).toBe(true);
      });

      it("should not match zero characters", () => {
        expect(matchesTrigger("MComponent", "M?Component")).toBe(false);
      });

      it("should not match multiple characters", () => {
        expect(matchesTrigger("MyxComponent", "M?Component")).toBe(false);
      });

      it("should match multiple ? for multiple characters", () => {
        expect(matchesTrigger("MyComponent", "??Component")).toBe(true);
        expect(matchesTrigger("ABComponent", "??Component")).toBe(true);
      });
    });

    describe("[] character class", () => {
      it("should match characters in set", () => {
        expect(matchesTrigger("MyComponent", "M[xyz]Component")).toBe(true);
        expect(matchesTrigger("MxComponent", "M[xyz]Component")).toBe(true);
        expect(matchesTrigger("MzComponent", "M[xyz]Component")).toBe(true);
      });

      it("should not match characters not in set", () => {
        expect(matchesTrigger("MaComponent", "M[xyz]Component")).toBe(false);
        expect(matchesTrigger("MbComponent", "M[xyz]Component")).toBe(false);
      });

      it("should support character ranges", () => {
        expect(matchesTrigger("M1Component", "M[0-9]Component")).toBe(true);
        expect(matchesTrigger("M5Component", "M[0-9]Component")).toBe(true);
        expect(matchesTrigger("MaComponent", "M[a-z]Component")).toBe(true);
        expect(matchesTrigger("MzComponent", "M[a-z]Component")).toBe(true);
      });
    });

    describe("complex glob patterns", () => {
      it("should match prefix with multiple wildcards", () => {
        expect(matchesTrigger("HandleClickButton", "Handle*Button")).toBe(
          true
        );
        expect(matchesTrigger("HandleSubmitButton", "Handle*Button")).toBe(
          true
        );
      });

      it("should match with pattern combining * and ?", () => {
        expect(matchesTrigger("MyComponent1", "MyComponent?")).toBe(true);
        expect(matchesTrigger("MyComponent2", "MyComponent?")).toBe(true);
        expect(matchesTrigger("MyComponent", "MyComponent?")).toBe(false);
      });

      it("should support nested patterns", () => {
        expect(
          matchesTrigger("App.Header.Title", "App.*.Title")
        ).toBe(true);
        expect(
          matchesTrigger("App.Footer.Title", "App.*.Title")
        ).toBe(true);
      });
    });
  });

  describe("regex pattern matching", () => {
    it("should match using regex pattern", () => {
      expect(matchesTrigger("MyComponent", /^My/)).toBe(true);
      expect(matchesTrigger("MyComponent", /Component$/)).toBe(true);
      expect(matchesTrigger("MyComponent", /^MyComponent$/)).toBe(true);
    });

    it("should not match when regex does not match", () => {
      expect(matchesTrigger("MyComponent", /^Other/)).toBe(false);
      expect(matchesTrigger("MyComponent", /Widget$/)).toBe(false);
    });

    it("should support complex regex patterns", () => {
      expect(matchesTrigger("MyComponent123", /Component\d+$/)).toBe(true);
      expect(matchesTrigger("MyComponent", /Component\d+$/)).toBe(false);
    });

    it("should support case-insensitive regex", () => {
      expect(matchesTrigger("MyComponent", /mycomponent/i)).toBe(true);
      expect(matchesTrigger("MYCOMPONENT", /mycomponent/i)).toBe(true);
    });
  });

  describe("real-world component names", () => {
    it("should match common React component patterns", () => {
      // Button components
      expect(matchesTrigger("PrimaryButton", "Primary*")).toBe(true);
      expect(matchesTrigger("SecondaryButton", "*Button")).toBe(true);

      // Page components
      expect(matchesTrigger("HomePage", "*Page")).toBe(true);
      expect(matchesTrigger("DashboardPage", "Dashboard*")).toBe(true);

      // Form components
      expect(matchesTrigger("LoginForm", "*Form")).toBe(true);
      expect(matchesTrigger("UserProfileForm", "User*")).toBe(true);

      // Layout components
      expect(matchesTrigger("AppLayout", "App*")).toBe(true);
      expect(matchesTrigger("SidebarLayout", "*Layout")).toBe(true);
    });

    it("should support namespaced components", () => {
      expect(matchesTrigger("App.Header", "App.*")).toBe(true);
      expect(matchesTrigger("UI.Button.Primary", "UI.Button.*")).toBe(true);
    });

    it("should support hook-style names", () => {
      // Although this is for components, it should work with any name pattern
      expect(matchesTrigger("useCustomHook", "use*")).toBe(true);
      expect(matchesTrigger("useEffectOnMount", "use*")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle components with special characters", () => {
      expect(matchesTrigger("My-Component", "My-*")).toBe(true);
      expect(matchesTrigger("My_Component", "My_*")).toBe(true);
      expect(matchesTrigger("My$Component", "My$*")).toBe(true);
    });

    it("should handle very long component names", () => {
      const longName = "A".repeat(1000);
      expect(matchesTrigger(longName, "A*")).toBe(true);
      expect(matchesTrigger(longName, longName)).toBe(true);
    });

    it("should handle single character component names", () => {
      expect(matchesTrigger("A", "A")).toBe(true);
      expect(matchesTrigger("A", "?")).toBe(true);
      expect(matchesTrigger("A", "*")).toBe(true);
    });

    it("should handle numeric component names", () => {
      expect(matchesTrigger("123Component", "123*")).toBe(true);
      expect(matchesTrigger("Component123", "*123")).toBe(true);
    });
  });
});
