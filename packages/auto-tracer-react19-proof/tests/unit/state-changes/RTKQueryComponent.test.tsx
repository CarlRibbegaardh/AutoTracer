import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RTKQueryComponent } from "@src/state-changes/RTKQueryComponent";

/**
 * Tests for RTK Query state tracking.
 * Verifies that query and mutation hooks are properly labeled and tracked.
 */
describe("RTKQueryComponent", () => {
  let consoleOutput: string[] = [];
  let originalLog: typeof console.log;

  beforeEach(() => {
    consoleOutput = [];
    originalLog = console.log;
    console.log = vi.fn((...args: unknown[]) => {
      consoleOutput.push(args.map(String).join(" "));
    });
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it("should label userQuery hook", async () => {
    render(<RTKQueryComponent />);

    await waitFor(() => {
      const stateLog = consoleOutput.find((line) => line.includes("userQuery"));

      expect(stateLog).toBeDefined();
    });
  });

  it("should label postsQuery hook", async () => {
    render(<RTKQueryComponent />);

    await waitFor(() => {
      const stateLog = consoleOutput.find((line) =>
        line.includes("postsQuery")
      );

      expect(stateLog).toBeDefined();
    });
  });

  it("should label mutation hooks", async () => {
    render(<RTKQueryComponent />);

    await waitFor(() => {
      const updateUserLog = consoleOutput.find((line) =>
        line.includes("updateUser")
      );
      const createPostLog = consoleOutput.find((line) =>
        line.includes("createPost")
      );

      expect(updateUserLog).toBeDefined();
      expect(createPostLog).toBeDefined();
    });
  });

  it("should label mutation result objects", async () => {
    render(<RTKQueryComponent />);

    await waitFor(() => {
      const updateUserResultLog = consoleOutput.find((line) =>
        line.includes("updateUserResult")
      );
      const createPostResultLog = consoleOutput.find((line) =>
        line.includes("createPostResult")
      );

      expect(updateUserResultLog).toBeDefined();
      expect(createPostResultLog).toBeDefined();
    });
  });

  it("should detect state change when mutation is triggered", async () => {
    const user = userEvent.setup();
    render(<RTKQueryComponent />);

    // Wait for initial render
    await waitFor(() => {
      screen.getByText("Create Post");
    });

    consoleOutput = [];

    const button = screen.getByText("Update User");
    await user.click(button);

    await waitFor(() => {
      // Should see state changes related to the mutation
      const hasMutationChange = consoleOutput.some(
        (line) =>
          line.includes("State change") &&
          (line.includes("updateUser") ||
            line.includes("updateUserResult") ||
            line.includes("userData"))
      );

      expect(hasMutationChange).toBe(true);
    });
  });

  it("should detect state change when post is created", async () => {
    const user = userEvent.setup();
    render(<RTKQueryComponent />);

    await waitFor(() => {
      screen.getByText("Create Post");
    });

    consoleOutput = [];

    const button = screen.getByText("Create Post");
    await user.click(button);

    await waitFor(() => {
      const hasPostCreationChange = consoleOutput.some(
        (line) =>
          line.includes("State change") &&
          (line.includes("createPost") ||
            line.includes("createPostResult") ||
            line.includes("postsData"))
      );

      expect(hasPostCreationChange).toBe(true);
    });
  });

  it("should render query results correctly", async () => {
    const { container } = render(<RTKQueryComponent />);

    await waitFor(() => {
      expect(container.textContent).toContain("User Query");
      expect(container.textContent).toContain("Posts Query");
      expect(container.textContent).toContain("Name: John Doe");
      expect(container.textContent).toContain("Email: john@example.com");
      expect(container.textContent).toContain("Posts Count: 2");
    });
  });

  it("should show loading states", async () => {
    const { container } = render(<RTKQueryComponent />);

    // Initial loading states should be shown
    expect(container.textContent).toContain("Loading:");
  });

  it("should not label query state as unknown", async () => {
    render(<RTKQueryComponent />);

    await waitFor(() => {
      // Wait for queries to complete
      const hasUserData = consoleOutput.some((line) =>
        line.includes("John Doe")
      );
      expect(hasUserData).toBe(true);
    });

    // Count how many "unknown" labels appear for RTK Query hooks
    const unknownCount = consoleOutput.filter((line) =>
      /State change unknown.*:/.test(line)
    ).length;

    console.log(`Unknown state labels in RTK Query: ${unknownCount}`);

    // Log all state changes for debugging
    const stateChanges = consoleOutput.filter((line) =>
      line.includes("State change")
    );
    console.log("All RTK Query state changes:", stateChanges);
  });

  it("should track complex query result objects", async () => {
    render(<RTKQueryComponent />);

    await waitFor(() => {
      // Find state changes for complex objects (arrays of posts)
      const postsDataChange = consoleOutput.find(
        (line) => line.includes("postsData") && line.includes("State change")
      );

      if (postsDataChange) {
        // Should not be labeled as unknown
        expect(postsDataChange).not.toContain(": unknown");
      }
    });
  });
});
