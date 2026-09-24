import type { NormalizedDashboardConfig } from "@src/types/DashboardConfig";
import { DashboardWidget } from "@src/widget/DashboardWidget";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const makeConfig = (): NormalizedDashboardConfig => ({
  enabled: true,
  hideByDefault: false,
  position: "bottom-right",
  hotkeys: { toggleTracing: "Alt+Shift+T", toggleDashboard: "Alt+Shift+D" },
});

const setupTracers = (opts: {
  react?: boolean;
  flow?: boolean;
  network?: boolean;
}): void => {
  (globalThis as Record<string, unknown>).autoTracer = {
    ...(opts.react ? { reactTracer: { isEnabled: () => false } } : {}),
    ...(opts.flow ? { flowTracer: { isEnabled: () => false } } : {}),
    ...(opts.network
      ? {
          networkTracer: {
            isEnabled: () => false,
            getState: () => "stopped",
            getPendingRequestCount: () => 0,
          },
        }
      : {}),
  };
};

const expandWidget = (root: HTMLDivElement): void => {
  const collapsed = root.querySelector(".dashboard-collapsed");
  if (collapsed instanceof HTMLElement) collapsed.click();
};

const getTabTexts = (root: HTMLDivElement): (string | null)[] =>
  Array.from(root.querySelectorAll(".dashboard-tab")).map((t) => t.textContent);

const clickTabByText = (root: HTMLDivElement, label: string): void => {
  const tab = Array.from(root.querySelectorAll(".dashboard-tab")).find(
    (t) => t.textContent === label,
  );
  if (tab instanceof HTMLElement) tab.click();
};

const advanceStatePolling = (): void => {
  vi.advanceTimersByTime(500);
};

describe("DashboardWidget tab strip", () => {
  let root: HTMLDivElement;
  let widget: DashboardWidget | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    document.getElementById("autotracer-dashboard-styles")?.remove();
    delete (globalThis as Record<string, unknown>).autoTracer;
    root = document.createElement("div");
    document.body.appendChild(root);
  });

  afterEach(() => {
    widget?.unmount();
    widget = undefined;
    root.remove();
    delete (globalThis as Record<string, unknown>).autoTracer;
    document.getElementById("autotracer-dashboard-styles")?.remove();
    vi.useRealTimers();
  });

  describe("tab strip renders correct tabs", () => {
    it("shows React, Flow, Keys tabs when both tracers available", () => {
      setupTracers({ react: true, flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      expect(getTabTexts(root)).toEqual(["React", "Flow", "Keys"]);
    });

    it("shows React and Keys tabs when only react tracer is available", () => {
      setupTracers({ react: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      expect(getTabTexts(root)).toEqual(["React", "Keys"]);
    });

    it("shows Flow and Keys tabs when only flow tracer is available", () => {
      setupTracers({ flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      expect(getTabTexts(root)).toEqual(["Flow", "Keys"]);
    });

    it("[NET-DASH-001] shows Network and Keys tabs when only NetworkTracer is available", () => {
      setupTracers({ network: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      expect(getTabTexts(root)).toEqual(["Network", "Keys"]);
    });

    it("shows only Keys tab when no tracers are available", () => {
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      expect(getTabTexts(root)).toEqual(["Keys"]);
    });
  });

  describe("default active tab", () => {
    it("defaults to React when react tracer is available", () => {
      setupTracers({ react: true, flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const activeTab = root.querySelector(".dashboard-tab.active");
      expect(activeTab?.textContent).toBe("React");
    });

    it("defaults to Flow when only flow tracer is available", () => {
      setupTracers({ flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const activeTab = root.querySelector(".dashboard-tab.active");
      expect(activeTab?.textContent).toBe("Flow");
    });

    it("[NET-DASH-001] defaults to Network when only NetworkTracer is available", () => {
      setupTracers({ network: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const activeTab = root.querySelector(".dashboard-tab.active");
      expect(activeTab?.textContent).toBe("Network");
    });

    it("defaults to Keys when no tracers are available", () => {
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const activeTab = root.querySelector(".dashboard-tab.active");
      expect(activeTab?.textContent).toBe("Keys");
    });
  });

  describe("tab switching", () => {
    it("clicking Flow tab makes Flow the active tab", () => {
      setupTracers({ react: true, flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      clickTabByText(root, "Flow");

      const activeTab = root.querySelector(".dashboard-tab.active");
      expect(activeTab?.textContent).toBe("Flow");
    });

    it("clicking Keys tab makes Keys the active tab", () => {
      setupTracers({ react: true, flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      clickTabByText(root, "Keys");

      const activeTab = root.querySelector(".dashboard-tab.active");
      expect(activeTab?.textContent).toBe("Keys");
    });

    it("clicking React tab after switching away restores React as active", () => {
      setupTracers({ react: true, flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      clickTabByText(root, "Flow");
      clickTabByText(root, "React");

      const activeTab = root.querySelector(".dashboard-tab.active");
      expect(activeTab?.textContent).toBe("React");
    });
  });

  describe("tab content visibility", () => {
    it("ReactTracer section is visible and Flow section is hidden on React tab", () => {
      setupTracers({ react: true, flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const sections = root.querySelectorAll(".dashboard-tracer-section");
      expect((sections[0] as HTMLElement).style.display).toBe("");
      expect((sections[1] as HTMLElement).style.display).toBe("none");
      expect(
        sections[0]?.querySelector(".dashboard-tracer-name")?.textContent,
      ).toBe("ReactTracer");
    });

    it("Flow section is visible and ReactTracer section is hidden on Flow tab", () => {
      setupTracers({ react: true, flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const tabs = root.querySelectorAll(".dashboard-tab");
      (tabs[1] as HTMLElement).click(); // Flow tab

      const sections = root.querySelectorAll(".dashboard-tracer-section");
      expect((sections[0] as HTMLElement).style.display).toBe("none");
      expect((sections[1] as HTMLElement).style.display).toBe("");
    });

    it("hotkeys section is visible on Keys tab", () => {
      setupTracers({ react: true, flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const tabs = root.querySelectorAll(".dashboard-tab");
      (tabs[2] as HTMLElement).click(); // Keys tab

      const hotkeysSection = root.querySelector(
        ".dashboard-hotkeys",
      ) as HTMLElement;
      expect(hotkeysSection.style.display).toBe("");
    });

    it("hotkeys section is hidden when React tab is active", () => {
      setupTracers({ react: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const hotkeysSection = root.querySelector(
        ".dashboard-hotkeys",
      ) as HTMLElement;
      expect(hotkeysSection.style.display).toBe("none");
    });

    it("hotkeys section is visible by default when no tracers are available", () => {
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const hotkeysSection = root.querySelector(
        ".dashboard-hotkeys",
      ) as HTMLElement;
      expect(hotkeysSection.style.display).toBe("");
    });
  });

  describe("late tracer discovery", () => {
    it("shows and selects a dormant ReactTracer that appears after mount", () => {
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      setupTracers({ react: true });
      advanceStatePolling();

      expect(getTabTexts(root)).toEqual(["React", "Keys"]);
      expect(root.querySelector(".dashboard-tab.active")?.textContent).toBe(
        "React",
      );
    });

    it("shows and selects a dormant FlowTracer that appears after mount", () => {
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      setupTracers({ flow: true });
      advanceStatePolling();

      expect(getTabTexts(root)).toEqual(["Flow", "Keys"]);
      expect(root.querySelector(".dashboard-tab.active")?.textContent).toBe(
        "Flow",
      );
    });

    it("[NET-DASH-008] shows and selects NetworkTracer when it appears after mount", () => {
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      setupTracers({ network: true });
      advanceStatePolling();

      expect(getTabTexts(root)).toEqual(["Network", "Keys"]);
      expect(root.querySelector(".dashboard-tab.active")?.textContent).toBe(
        "Network",
      );
    });

    it("preserves an explicit Keys selection when ReactTracer appears", () => {
      setupTracers({ flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);
      clickTabByText(root, "Keys");

      setupTracers({ react: true, flow: true });
      advanceStatePolling();

      expect(getTabTexts(root)).toEqual(["React", "Flow", "Keys"]);
      expect(root.querySelector(".dashboard-tab.active")?.textContent).toBe(
        "Keys",
      );
    });

    it("selects Flow when the selected ReactTracer disappears", () => {
      setupTracers({ react: true, flow: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      setupTracers({ flow: true });
      advanceStatePolling();

      expect(getTabTexts(root)).toEqual(["Flow", "Keys"]);
      expect(root.querySelector(".dashboard-tab.active")?.textContent).toBe(
        "Flow",
      );
    });

    it("updates start and stop state after discovering ReactTracer", () => {
      let isEnabled = false;
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      (globalThis as Record<string, unknown>).autoTracer = {
        reactTracer: { isEnabled: () => isEnabled },
      };
      advanceStatePolling();

      isEnabled = true;
      advanceStatePolling();
      expect(root.querySelector(".dashboard-button")?.textContent).toBe("Stop");

      isEnabled = false;
      advanceStatePolling();
      expect(root.querySelector(".dashboard-button")?.textContent).toBe(
        "Start",
      );
    });
  });

  describe("NetworkTracer controls", () => {
    it("[NET-CONFIG-001..002][NET-DASH-002] renders and wires lifecycle and primary capture controls", () => {
      const start = vi.fn();
      const stop = vi.fn();
      const setEnabledOnLoad = vi.fn();
      const setCaptureRequestHeaders = vi.fn();
      const setCaptureRequestBody = vi.fn();
      const setCaptureResponseHeaders = vi.fn();
      const setCaptureResponseBody = vi.fn();
      (globalThis as Record<string, unknown>).autoTracer = {
        networkTracer: {
          start,
          stop,
          forceStop: vi.fn(),
          isEnabled: () => false,
          getState: () => "stopped",
          getPendingRequestCount: () => 0,
          getEnabledOnLoad: () => true,
          setEnabledOnLoad,
          getCaptureRequestHeaders: () => false,
          setCaptureRequestHeaders,
          getCaptureRequestBody: () => false,
          setCaptureRequestBody,
          getCaptureResponseHeaders: () => false,
          setCaptureResponseHeaders,
          getCaptureResponseBody: () => false,
          setCaptureResponseBody,
        },
      };
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const section = Array.from(
        root.querySelectorAll<HTMLElement>(".dashboard-tracer-section"),
      ).find((candidate) => candidate.textContent?.includes("NetworkTracer"));
      expect(section?.textContent).toContain("Enable on load");
      expect(section?.textContent).toContain("Capture request headers");
      expect(section?.textContent).toContain("Capture request body");
      expect(section?.textContent).toContain("Capture response headers");
      expect(section?.textContent).toContain("Capture response body");

      const startButton =
        section?.querySelector<HTMLButtonElement>(".dashboard-button");
      expect(startButton?.textContent).toBe("Start");
      startButton?.click();
      expect(start).toHaveBeenCalledOnce();
      expect(stop).not.toHaveBeenCalled();

      const checkboxes = section?.querySelectorAll<HTMLInputElement>(
        ':scope > label.dashboard-checkbox-label > input[type="checkbox"]',
      );
      expect(checkboxes?.length).toBe(5);
      checkboxes?.forEach((checkbox) => {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event("change"));
      });
      expect(setEnabledOnLoad).toHaveBeenCalledExactlyOnceWith(false);
      expect(setCaptureRequestHeaders).toHaveBeenCalledExactlyOnceWith(true);
      expect(setCaptureRequestBody).toHaveBeenCalledExactlyOnceWith(true);
      expect(setCaptureResponseHeaders).toHaveBeenCalledExactlyOnceWith(true);
      expect(setCaptureResponseBody).toHaveBeenCalledExactlyOnceWith(true);
    });

    it("[NET-CONFIG-001..002][NET-DASH-003] renders and wires advanced configuration controls", () => {
      const setBodyCaptureLimit = vi.fn();
      const setWaitForPendingRequestsOnStop = vi.fn();
      const setAutoStopAfterRequests = vi.fn();
      const setRedactionPatterns = vi.fn();
      const setIncludePatterns = vi.fn();
      const setExcludePatterns = vi.fn();
      const resetConfig = vi.fn();
      (globalThis as Record<string, unknown>).autoTracer = {
        networkTracer: {
          start: vi.fn(),
          stop: vi.fn(),
          forceStop: vi.fn(),
          isEnabled: () => false,
          getState: () => "stopped",
          getPendingRequestCount: () => 0,
          getEnabledOnLoad: () => false,
          getCaptureRequestHeaders: () => false,
          getCaptureRequestBody: () => false,
          getCaptureResponseHeaders: () => false,
          getCaptureResponseBody: () => false,
          getBodyCaptureLimit: () => 65_536,
          setBodyCaptureLimit,
          getWaitForPendingRequestsOnStop: () => true,
          setWaitForPendingRequestsOnStop,
          getAutoStopAfterRequests: () => undefined,
          setAutoStopAfterRequests,
          getRedactionPatterns: () => ["authorization", "token*"],
          setRedactionPatterns,
          getIncludePatterns: () => ["/api/**"],
          setIncludePatterns,
          getExcludePatterns: () => ["/api/health"],
          setExcludePatterns,
          resetConfig,
        },
      };
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const section = Array.from(
        root.querySelectorAll<HTMLElement>(".dashboard-tracer-section"),
      ).find((candidate) => candidate.textContent?.includes("NetworkTracer"));
      const advanced = section?.querySelector<HTMLDetailsElement>("details");
      expect(advanced?.className).toBe("dashboard-advanced");
      expect(advanced?.querySelector("summary")?.textContent).toBe("Advanced");
      expect(advanced?.querySelector("summary")?.className).toBe(
        "dashboard-advanced-summary",
      );
      if (advanced === undefined || advanced === null) return;
      expect(advanced.textContent).toContain("Body capture limit");
      expect(advanced.textContent).toContain(
        "Wait for pending requests on manual stop",
      );
      expect(advanced.textContent).toContain("Automatic stop request limit");
      expect(advanced.textContent).toContain("Redaction patterns");
      expect(advanced.textContent).toContain("Include URL globs");
      expect(advanced.textContent).toContain("Exclude URL globs");
      expect(advanced.textContent).toContain("Reset configuration");

      const inputs = advanced.querySelectorAll<HTMLInputElement>("input");
      expect(inputs.length).toBe(3);
      inputs.item(0).value = "2048";
      inputs.item(0).dispatchEvent(new Event("change"));
      inputs.item(1).checked = false;
      inputs.item(1).dispatchEvent(new Event("change"));
      inputs.item(2).value = "25";
      inputs.item(2).dispatchEvent(new Event("change"));

      const textareas = advanced.querySelectorAll<HTMLTextAreaElement>(
        "textarea",
      );
      expect(textareas.length).toBe(3);
      expect(
        advanced.querySelectorAll(".dashboard-textarea-group").length,
      ).toBe(3);
      textareas.forEach((textarea) => {
        expect(textarea.id).not.toBe("");
        expect(
          advanced.querySelector(`label[for="${textarea.id}"]`),
        ).not.toBeNull();
      });
      textareas.item(0).value = "authorization\ntoken*";
      textareas.item(0).dispatchEvent(new Event("change"));
      textareas.item(1).value = "/api/**\nhttps://example.com/**";
      textareas.item(1).dispatchEvent(new Event("change"));
      textareas.item(2).value = "/api/health\n**/*.map";
      textareas.item(2).dispatchEvent(new Event("change"));

      const resetButton = Array.from(
        advanced.querySelectorAll<HTMLButtonElement>("button"),
      ).find((button) => button.textContent === "Reset configuration");
      expect(resetButton?.className).toBe(
        "dashboard-btn dashboard-reset-button",
      );
      resetButton?.click();

      expect(setBodyCaptureLimit).toHaveBeenCalledExactlyOnceWith(2048);
      expect(setWaitForPendingRequestsOnStop).toHaveBeenCalledExactlyOnceWith(
        false,
      );
      expect(setAutoStopAfterRequests).toHaveBeenCalledExactlyOnceWith(25);
      expect(setRedactionPatterns).toHaveBeenCalledExactlyOnceWith([
        "authorization",
        "token*",
      ]);
      expect(setIncludePatterns).toHaveBeenCalledExactlyOnceWith([
        "/api/**",
        "https://example.com/**",
      ]);
      expect(setExcludePatterns).toHaveBeenCalledExactlyOnceWith([
        "/api/health",
        "**/*.map",
      ]);
      expect(resetConfig).toHaveBeenCalledOnce();
    });

    it("keeps the expanded dashboard within the viewport", () => {
      setupTracers({ network: true });
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const expanded = root.querySelector(".dashboard-expanded");
      const scrollContent = expanded?.querySelector(
        ":scope > .dashboard-scroll-content",
      );
      const tabStrip = expanded?.querySelector(":scope > .dashboard-tab-strip");
      const styles = document.getElementById(
        "autotracer-dashboard-styles",
      )?.textContent;

      expect(scrollContent).toBeInstanceOf(HTMLElement);
      expect(tabStrip).not.toBeNull();
      if (!(scrollContent instanceof HTMLElement)) return;
      expect(
        scrollContent.querySelector(".dashboard-tracer-section"),
      ).not.toBeNull();
      expect(scrollContent.querySelector(".dashboard-tab-strip")).toBeNull();
      expect(styles).toContain("max-height: calc(100vh - 40px)");
      expect(styles).toContain(".dashboard-scroll-content");
      expect(styles).toContain("overflow-y: auto");
      expect(styles).toContain(".dashboard-reset-button");
    });

    it("[NET-CONFIG-013][NET-DASH-006] prevents invalid numeric submission and shows inline errors", () => {
      const setBodyCaptureLimit = vi.fn();
      const setAutoStopAfterRequests = vi.fn();
      (globalThis as Record<string, unknown>).autoTracer = {
        networkTracer: {
          start: vi.fn(),
          stop: vi.fn(),
          forceStop: vi.fn(),
          isEnabled: () => false,
          getState: () => "stopped",
          getPendingRequestCount: () => 0,
          getBodyCaptureLimit: () => 65_536,
          setBodyCaptureLimit,
          getWaitForPendingRequestsOnStop: () => false,
          getAutoStopAfterRequests: () => undefined,
          setAutoStopAfterRequests,
          getRedactionPatterns: () => [],
          getIncludePatterns: () => [],
          getExcludePatterns: () => [],
        },
      };
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const advanced = Array.from(
        root.querySelectorAll<HTMLElement>(".dashboard-tracer-section"),
      )
        .find((candidate) => candidate.textContent?.includes("NetworkTracer"))
        ?.querySelector<HTMLDetailsElement>("details");
      expect(advanced).toBeDefined();
      if (advanced === undefined || advanced === null) return;

      const numberInputs = advanced.querySelectorAll<HTMLInputElement>(
        'input[type="number"]',
      );
      expect(numberInputs.length).toBe(2);
      numberInputs.item(0).value = "0";
      numberInputs.item(0).dispatchEvent(new Event("change"));
      numberInputs.item(1).value = "1.5";
      numberInputs.item(1).dispatchEvent(new Event("change"));

      expect(setBodyCaptureLimit).not.toHaveBeenCalled();
      expect(setAutoStopAfterRequests).not.toHaveBeenCalled();
      expect(
        Array.from(
          advanced.querySelectorAll<HTMLElement>(
            ".dashboard-validation-error",
          ),
        ).map((error) => error.textContent),
      ).toEqual([
        "Body capture limit must be a positive integer.",
        "Automatic stop request limit must be a positive integer.",
      ]);
    });

    it("[NET-DASH-006][NET-CONFIG-015] prevents invalid glob submission and shows an inline error", () => {
      const setIncludePatterns = vi.fn();
      (globalThis as Record<string, unknown>).autoTracer = {
        networkTracer: {
          start: vi.fn(),
          stop: vi.fn(),
          forceStop: vi.fn(),
          isEnabled: () => false,
          getState: () => "stopped",
          getPendingRequestCount: () => 0,
          getBodyCaptureLimit: () => 65_536,
          getWaitForPendingRequestsOnStop: () => false,
          getAutoStopAfterRequests: () => undefined,
          getRedactionPatterns: () => [],
          getIncludePatterns: () => ["/api/**"],
          setIncludePatterns,
          getExcludePatterns: () => [],
        },
      };
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const advanced = Array.from(
        root.querySelectorAll<HTMLElement>(".dashboard-tracer-section"),
      )
        .find((candidate) => candidate.textContent?.includes("NetworkTracer"))
        ?.querySelector<HTMLDetailsElement>("details");
      expect(advanced).toBeDefined();
      if (advanced === undefined || advanced === null) return;

      const includeInput = advanced
        .querySelectorAll<HTMLTextAreaElement>("textarea")
        .item(1);
      includeInput.value = "**/*.{malformed";
      includeInput.dispatchEvent(new Event("change"));

      expect(setIncludePatterns).not.toHaveBeenCalled();
      expect(
        advanced.querySelector<HTMLElement>(".dashboard-validation-error")
          ?.textContent,
      ).toBe("Include URL globs contain an invalid glob: **/*.{malformed");
    });

    it("[NET-DASH-004..005] shows pending drain state and wires Stop now", () => {
      const forceStop = vi.fn();
      (globalThis as Record<string, unknown>).autoTracer = {
        networkTracer: {
          start: vi.fn(),
          stop: vi.fn(),
          forceStop,
          isEnabled: () => false,
          getState: () => "stopping",
          getPendingRequestCount: () => 3,
          getEnabledOnLoad: () => false,
          getCaptureRequestHeaders: () => false,
          getCaptureRequestBody: () => false,
          getCaptureResponseHeaders: () => false,
          getCaptureResponseBody: () => false,
        },
      };
      widget = new DashboardWidget(makeConfig());
      widget.mount(root);
      expandWidget(root);

      const section = Array.from(
        root.querySelectorAll<HTMLElement>(".dashboard-tracer-section"),
      ).find((candidate) => candidate.textContent?.includes("NetworkTracer"));
      expect(section?.textContent).toContain("Stopping (3 pending)");

      const stopNow = Array.from(
        section?.querySelectorAll<HTMLButtonElement>("button") ?? [],
      ).find((button) => button.textContent === "Stop now");
      stopNow?.click();

      expect(forceStop).toHaveBeenCalledOnce();
    });
  });
});
