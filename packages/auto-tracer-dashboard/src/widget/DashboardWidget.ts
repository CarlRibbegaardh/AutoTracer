import type {
  DashboardPosition,
  NormalizedDashboardConfig,
} from "../types/DashboardConfig.js";

import { hasBeenShown, markAsShown } from "./storage.js";

/**
 * Default auto-stop limit for React tracer (number of renders).
 */
const DEFAULT_AUTOSTOP_REACT_RENDERS = 200;

/**
 * Default auto-stop limit for Flow tracer top-level functions.
 */
const DEFAULT_AUTOSTOP_FLOW_TOPLEVEL = 500;

/**
 * Default auto-stop limit for Flow tracer total function calls.
 */
const DEFAULT_AUTOSTOP_FLOW_TOTAL = 10000;

/**
 * Check if system color scheme is dark.
 *
 * @returns True if dark mode is preferred.
 */
const isDarkMode = (): boolean => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Get CSS class for widget position.
 *
 * @param position - Dashboard position.
 * @returns CSS class name.
 */
const getPositionClass = (position: DashboardPosition): string => {
  return `dashboard-position-${position}`;
};

/**
 * Inject widget styles into document head.
 *
 * @param isDark - Whether dark mode is active.
 */
const injectStyles = (isDark: boolean): void => {
  const styleId = "autotracer-dashboard-styles";
  if (document.getElementById(styleId)) {
    return; // Already injected
  }

  const colors = isDark
    ? {
        bg: "#1e1e1e",
        bgHover: "#2d2d2d",
        text: "#cccccc",
        border: "#3e3e3e",
        statusRunning: "#25D366",
        statusStopped: "#6e6e6e",
      }
    : {
        bg: "#ffffff",
        bgHover: "#f3f3f3",
        text: "#333333",
        border: "#d1d1d1",
        statusRunning: "#25D366",
        statusStopped: "#95a5a6",
      };

  const css = `
    .autotracer-dashboard {
      position: fixed;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
    }
    .autotracer-dashboard.dashboard-position-bottom-right { bottom: 20px; right: 20px; }
    .autotracer-dashboard.dashboard-position-bottom-left { bottom: 20px; left: 20px; }
    .autotracer-dashboard.dashboard-position-top-right { top: 20px; right: 20px; }
    .autotracer-dashboard.dashboard-position-top-left { top: 20px; left: 20px; }
    .autotracer-dashboard .dashboard-collapsed {
      width: 35px;
      height: 35px;
      border-radius: 20px;
      background: ${colors.bg};
      border: 2px solid ${colors.border};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      transition: all 0.2s;
    }
    .autotracer-dashboard .dashboard-collapsed:hover {
      background: ${colors.bgHover};
      transform: scale(1.05);
    }
    .autotracer-dashboard .dashboard-status-indicator {
      width: 20px;
      height: 20px;
      border-radius: 10px;
    }
    .autotracer-dashboard .status-running { background: ${colors.statusRunning}; }
    .autotracer-dashboard .status-stopped { background: ${colors.statusStopped}; }
    .autotracer-dashboard .dashboard-expanded {
      min-width: 280px;
      max-height: calc(100vh - 40px);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: ${colors.bg};
      border: 2px solid ${colors.border};
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      color: ${colors.text};
    }
    .autotracer-dashboard .dashboard-header {
      display: flex;
      flex-shrink: 0;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid ${colors.border};
    }
    .autotracer-dashboard .dashboard-title {
      font-weight: 600;
      font-size: 16px;
    }
    .autotracer-dashboard .dashboard-close {
      background: transparent;
      border: none;
      color: ${colors.text};
      cursor: pointer;
      font-size: 20px;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .autotracer-dashboard .dashboard-close:hover {
      background: ${colors.bgHover};
      border-radius: 4px;
    }
    .autotracer-dashboard .dashboard-tracer-section {
      margin-bottom: 12px;
    }
    .autotracer-dashboard .dashboard-tracer-name {
      font-weight: bold;
      font-size: 20px;
      color: ${colors.text};
      opacity: 0.8;
      margin-bottom: 8px;
    }
    .autotracer-dashboard .dashboard-button {
      width: 100%;
      padding: 8px 16px;
      background: ${colors.bgHover};
      border: 1px solid ${colors.border};
      border-radius: 4px;
      color: ${colors.text};
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .autotracer-dashboard .dashboard-button:hover {
      background: ${colors.bg};
      border-color: ${colors.statusRunning};
    }
    .autotracer-dashboard .dashboard-button.running {
      background: ${colors.statusRunning};
      color: ${isDark ? "#1e1e1e" : "#ffffff"};
      border-color: ${colors.statusRunning};
    }
    .autotracer-dashboard .dashboard-button.running:hover {
      opacity: 0.9;
    }
    .autotracer-dashboard .dashboard-checkbox-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: ${colors.text};
      opacity: 0.9;
      margin-top: 8px;
      cursor: pointer;
      user-select: none;
    }
    .autotracer-dashboard .dashboard-checkbox-label input[type="checkbox"] {
      cursor: pointer;
      margin: 0;
    }
    .autotracer-dashboard .dashboard-input-group {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: ${colors.text};
      opacity: 0.9;
      margin-top: 8px;
    }
    .autotracer-dashboard .dashboard-input-group label {
      flex-shrink: 0;
    }
    .autotracer-dashboard .dashboard-input-group input[type="number"] {
      width: 70px;
      padding: 2px 6px;
      background: ${colors.bgHover};
      border: 1px solid ${colors.border};
      border-radius: 3px;
      color: ${colors.text};
      font-size: 12px;
    }
    .autotracer-dashboard .dashboard-input-group input[type="number"]:focus {
      outline: none;
      border-color: ${colors.statusRunning};
    }
    .autotracer-dashboard .dashboard-input-group input[type="number"]:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .autotracer-dashboard .dashboard-validation-error {
      color: #d13438;
      font-size: 11px;
    }
    .autotracer-dashboard .dashboard-input-group input[type="checkbox"] {
      cursor: pointer;
      margin: 0;
    }
    .autotracer-dashboard .dashboard-input-group input[type="text"] {
      flex: 1;
      padding: 4px 8px;
      background: ${colors.bgHover};
      border: 1px solid ${colors.border};
      border-radius: 3px;
      color: ${colors.text};
      font-size: 12px;
    }
    .autotracer-dashboard .dashboard-input-group input[type="text"]:focus {
      outline: none;
      border-color: ${colors.statusRunning};
    }
    .autotracer-dashboard .dashboard-input-group input[type="text"]::placeholder {
      color: ${colors.text};
      opacity: 0.4;
    }
    .autotracer-dashboard .dashboard-input-group select {
      padding: 4px 8px;
      background: ${colors.bgHover};
      border: 1px solid ${colors.border};
      border-radius: 3px;
      color: ${colors.text};
      font-size: 12px;
      cursor: pointer;
    }
    .autotracer-dashboard .dashboard-input-group select:focus {
      outline: none;
      border-color: ${colors.statusRunning};
    }
    .autotracer-dashboard .dashboard-advanced {
      width: 100%;
      box-sizing: border-box;
      margin-top: 12px;
      border: 1px solid ${colors.border};
      border-radius: 4px;
      overflow: hidden;
    }
    .autotracer-dashboard .dashboard-advanced-summary {
      padding: 8px 10px;
      background: ${colors.bgHover};
      color: ${colors.text};
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      user-select: none;
    }
    .autotracer-dashboard .dashboard-advanced-summary:focus-visible {
      outline: 2px solid ${colors.statusRunning};
      outline-offset: -2px;
    }
    .autotracer-dashboard .dashboard-advanced[open] > .dashboard-advanced-summary {
      border-bottom: 1px solid ${colors.border};
    }
    .autotracer-dashboard .dashboard-advanced-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px;
    }
    .autotracer-dashboard .dashboard-advanced-content > .dashboard-input-group,
    .autotracer-dashboard .dashboard-advanced-content > .dashboard-checkbox-label {
      margin-top: 0;
    }
    .autotracer-dashboard .dashboard-textarea-group {
      display: grid;
      gap: 4px;
      color: ${colors.text};
      font-size: 12px;
      opacity: 0.9;
    }
    .autotracer-dashboard .dashboard-textarea-group textarea {
      width: 100%;
      min-height: 54px;
      box-sizing: border-box;
      padding: 6px 8px;
      resize: vertical;
      background: ${colors.bgHover};
      border: 1px solid ${colors.border};
      border-radius: 3px;
      color: ${colors.text};
      font-family: inherit;
      font-size: 12px;
    }
    .autotracer-dashboard .dashboard-textarea-group textarea:focus {
      outline: none;
      border-color: ${colors.statusRunning};
    }
    .autotracer-dashboard .dashboard-section-header {
      font-weight: 600;
      font-size: 13px;
      color: ${colors.text};
      opacity: 0.7;
      margin-top: 12px;
      margin-bottom: 4px;
      padding-bottom: 4px;
      border-bottom: 1px solid ${colors.border};
    }
    .autotracer-dashboard .dashboard-btn {
      padding: 6px 12px;
      background: ${colors.bgHover};
      border: 1px solid ${colors.border};
      border-radius: 4px;
      color: ${colors.text};
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }
    .autotracer-dashboard .dashboard-btn:hover {
      background: ${colors.bg};
      border-color: ${colors.statusRunning};
    }
    .autotracer-dashboard .dashboard-reset-button {
      align-self: flex-start;
      max-width: 100%;
      box-sizing: border-box;
    }
    .autotracer-dashboard .dashboard-hotkeys {
      font-size: 11px;
      color: ${colors.text};
      opacity: 0.7;
    }
    .autotracer-dashboard .dashboard-scroll-content {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    .autotracer-dashboard .dashboard-tab-strip {
      display: flex;
      flex-shrink: 0;
      gap: 2px;
      margin-top: 12px;
      border-top: 1px solid ${colors.border};
    }
    .autotracer-dashboard .dashboard-tab {
      padding: 6px 12px;
      background: transparent;
      border: none;
      border-top: 2px solid transparent;
      color: ${colors.text};
      cursor: pointer;
      font-size: 13px;
      opacity: 0.7;
      margin-top: -1px;
    }
    .autotracer-dashboard .dashboard-tab:hover {
      opacity: 1;
      background: ${colors.bgHover};
    }
    .autotracer-dashboard .dashboard-tab.active {
      opacity: 1;
      border-top-color: ${colors.statusRunning};
      font-weight: 600;
    }
    .autotracer-dashboard .dashboard-hotkeys-title {
      font-weight: 600;
      margin-bottom: 6px;
      opacity: 0.9;
    }
    .autotracer-dashboard .dashboard-hotkey-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .autotracer-dashboard .dashboard-hotkey-label {
      flex: 1;
    }
    .autotracer-dashboard .dashboard-hotkey-keys {
      font-family: 'Courier New', monospace;
      background: ${colors.bgHover};
      padding: 2px 6px;
      border-radius: 3px;
      border: 1px solid ${colors.border};
      font-size: 10px;
    }
    .autotracer-dashboard.dashboard-hidden {
      display: none;
    }
  `;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
};

/**
 * Create collapsed widget DOM element.
 *
 * @param isRunning - Whether any tracer is currently running.
 * @returns HTMLElement representing collapsed widget.
 */
const createCollapsedWidget = (isRunning: boolean): HTMLDivElement => {
  const collapsed = document.createElement("div");
  collapsed.className = "dashboard-collapsed";

  const indicator = document.createElement("div");
  indicator.className = `dashboard-status-indicator ${isRunning ? "status-running" : "status-stopped"}`;

  collapsed.appendChild(indicator);
  return collapsed;
};

/**
 * Create expanded widget DOM element.
 *
 * @param onClose - Callback when close button is clicked.
 * @param onToggleReact - Callback when React tracer button is clicked.
 * @param onToggleFlow - Callback when Flow tracer button is clicked.
 * @param onReactEnabledOnLoadChange - Callback when React enabledOnLoad checkbox changes.
 * @param onFlowEnabledOnLoadChange - Callback when Flow enabledOnLoad checkbox changes.
 * @param onReactAutoStopChange - Callback when React auto-stop input changes.
 * @param onFlowAutoStopTopLevelChange - Callback when Flow top-level auto-stop input changes.
 * @param onFlowAutoStopAllChange - Callback when Flow all functions auto-stop input changes.
 * @param onReactStartTriggerChange - Callback when React start trigger changes.
 * @param onReactEndTriggerChange - Callback when React end trigger changes.
 * @param onReactEndTriggerModeChange - Callback when React end trigger mode changes.
 * @param onReactTriggerRearmModeChange - Callback when React trigger rearm mode changes.
 * @param onReactClearTriggers - Callback when React clear triggers button is clicked.
 * @param onFlowStartTriggerChange - Callback when Flow start trigger changes.
 * @param onFlowEndTriggerChange - Callback when Flow end trigger changes.
 * @param onFlowEndTriggerModeChange - Callback when Flow end trigger mode changes.
 * @param onFlowTriggerRearmModeChange - Callback when Flow trigger rearm mode changes.
 * @param onFlowClearTriggers - Callback when Flow clear triggers button is clicked.
 * @param reactRunning - Whether React tracer is running.
 * @param flowRunning - Whether Flow tracer is running.
 * @param reactEnabledOnLoad - Whether React tracer is set to auto-start.
 * @param flowEnabledOnLoad - Whether Flow tracer is set to auto-start.
 * @param reactAutoStopRenders - React auto-stop render limit, or null.
 * @param flowAutoStopTopLevel - Flow auto-stop top-level limit, or null.
 * @param flowAutoStopAll - Flow auto-stop all functions limit, or null.
 * @param reactStartTrigger - React start trigger pattern, or null.
 * @param reactEndTrigger - React end trigger pattern, or null.
 * @param reactEndTriggerMode - React end trigger mode.
 * @param reactTriggerRearmMode - React trigger rearm mode.
 * @param flowStartTrigger - Flow start trigger pattern, or null.
 * @param flowEndTrigger - Flow end trigger pattern, or null.
 * @param flowEndTriggerMode - Flow end trigger mode.
 * @param flowTriggerRearmMode - Flow trigger rearm mode.
 * @param hasReactTracer - Whether React tracer is available.
 * @param hasFlowTracer - Whether Flow tracer is available.
 * @param network - Network tracer state and primary control operations.
 * @param hotkeys - Hotkey configuration.
 * @param activeTab - The currently active tab.
 * @param onTabChange - Callback when a tab is selected.
 * @returns HTMLElement representing expanded widget.
 */
const createExpandedWidget = (
  onClose: () => void,
  onToggleReact: () => void,
  onToggleFlow: () => void,
  onReactEnabledOnLoadChange: (enabled: boolean) => void,
  onFlowEnabledOnLoadChange: (enabled: boolean) => void,
  onReactAutoStopChange: (limit: number | null) => void,
  onFlowAutoStopTopLevelChange: (limit: number | null) => void,
  onFlowAutoStopAllChange: (limit: number | null) => void,
  onReactStartTriggerChange: (pattern: string | null) => void,
  onReactEndTriggerChange: (pattern: string | null) => void,
  onReactEndTriggerModeChange: (mode: "on-entry" | "on-exit") => void,
  onReactTriggerRearmModeChange: (mode: "always" | "once") => void,
  onReactClearTriggers: () => void,
  onFlowStartTriggerChange: (pattern: string | null) => void,
  onFlowEndTriggerChange: (pattern: string | null) => void,
  onFlowEndTriggerModeChange: (mode: "on-entry" | "on-exit") => void,
  onFlowTriggerRearmModeChange: (mode: "always" | "once") => void,
  onFlowClearTriggers: () => void,
  reactRunning: boolean,
  flowRunning: boolean,
  reactEnabledOnLoad: boolean,
  flowEnabledOnLoad: boolean,
  reactAutoStopRenders: number | null,
  flowAutoStopTopLevel: number | null,
  flowAutoStopAll: number | null,
  reactStartTrigger: string | null,
  reactEndTrigger: string | null,
  reactEndTriggerMode: "on-entry" | "on-exit",
  reactTriggerRearmMode: "always" | "once",
  flowStartTrigger: string | null,
  flowEndTrigger: string | null,
  flowEndTriggerMode: "on-entry" | "on-exit",
  flowTriggerRearmMode: "always" | "once",
  hasReactTracer: boolean,
  hasFlowTracer: boolean,
  network: Readonly<{
    available: boolean;
    state: "stopped" | "running" | "stopping";
    pendingRequestCount: number;
    enabledOnLoad: boolean;
    captureRequestHeaders: boolean;
    captureRequestBody: boolean;
    captureResponseHeaders: boolean;
    captureResponseBody: boolean;
    bodyCaptureLimit: number;
    waitForPendingRequestsOnStop: boolean;
    autoStopAfterRequests: number | undefined;
    redactionPatterns: readonly string[];
    includePatterns: readonly string[];
    excludePatterns: readonly string[];
    toggle: () => void;
    forceStop: () => void;
    setEnabledOnLoad: (value: boolean) => void;
    setCaptureRequestHeaders: (value: boolean) => void;
    setCaptureRequestBody: (value: boolean) => void;
    setCaptureResponseHeaders: (value: boolean) => void;
    setCaptureResponseBody: (value: boolean) => void;
    setBodyCaptureLimit: (value: number) => void;
    setWaitForPendingRequestsOnStop: (value: boolean) => void;
    setAutoStopAfterRequests: (value: number | undefined) => void;
    setRedactionPatterns: (value: readonly string[]) => void;
    setIncludePatterns: (value: readonly string[]) => void;
    setExcludePatterns: (value: readonly string[]) => void;
    resetConfig: () => void;
  }>,
  hotkeys: { toggleTracing: string; toggleDashboard: string },
  activeTab: "react" | "flow" | "network" | "keys",
  onTabChange: (tab: "react" | "flow" | "network" | "keys") => void,
): HTMLDivElement => {
  /** Creates one NetworkTracer primary boolean control. */
  function createNetworkCheckbox(
    label: string,
    checked: boolean,
    onChange: (value: boolean) => void,
  ): HTMLLabelElement {
    const control = document.createElement("label");
    control.className = "dashboard-checkbox-label";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.addEventListener("change", () => onChange(input.checked));
    control.appendChild(input);
    control.appendChild(document.createTextNode(` ${label}`));
    return control;
  }

  /** Creates a required positive-integer change handler. */
  function createPositiveIntegerChangeHandler(
    input: HTMLInputElement,
    error: HTMLElement,
    onValid: (value: number) => void,
  ): () => void {
    return function handlePositiveIntegerChange(): void {
      const value = input.valueAsNumber;
      if (!Number.isInteger(value) || value <= 0) {
        error.className = "dashboard-validation-error";
        error.textContent = "Body capture limit must be a positive integer.";
        return;
      }
      error.className = "";
      error.textContent = "";
      onValid(value);
    };
  }

  /** Creates an optional positive-integer change handler. */
  function createOptionalPositiveIntegerChangeHandler(
    input: HTMLInputElement,
    error: HTMLElement,
    onValid: (value: number | undefined) => void,
  ): () => void {
    return function handleOptionalPositiveIntegerChange(): void {
      if (input.value === "") {
        error.className = "";
        error.textContent = "";
        onValid(undefined);
        return;
      }
      const value = input.valueAsNumber;
      if (!Number.isInteger(value) || value <= 0) {
        error.className = "dashboard-validation-error";
        error.textContent =
          "Automatic stop request limit must be a positive integer.";
        return;
      }
      error.className = "";
      error.textContent = "";
      onValid(value);
    };
  }

  /** Creates a validated glob-list change handler. */
  function createGlobListChangeHandler(
    input: HTMLTextAreaElement,
    error: HTMLElement,
    onValid: (value: readonly string[]) => void,
  ): () => void {
    return function handleGlobListChange(): void {
      const patterns = input.value
        .split(/\r?\n/u)
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
      const invalidPattern = patterns.find(
        (pattern) => pattern.includes("{") !== pattern.includes("}"),
      );
      if (invalidPattern !== undefined) {
        const label = input.getAttribute("aria-label") ?? "URL globs";
        error.className = "dashboard-validation-error";
        error.textContent = `${label} contain an invalid glob: ${invalidPattern}`;
        return;
      }
      error.className = "";
      error.textContent = "";
      onValid(patterns);
    };
  }

  const expanded = document.createElement("div");
  expanded.className = "dashboard-expanded";

  // Header
  const header = document.createElement("div");
  header.className = "dashboard-header";

  const title = document.createElement("div");
  title.className = "dashboard-title";
  title.textContent = "AutoTracer";

  const closeBtn = document.createElement("button");
  closeBtn.className = "dashboard-close";
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", onClose);

  header.appendChild(title);
  header.appendChild(closeBtn);
  expanded.appendChild(header);

  const scrollContent = document.createElement("div");
  scrollContent.className = "dashboard-scroll-content";
  expanded.appendChild(scrollContent);

  // Tab strip (built here, appended at the bottom after all content)
  const tabStrip = document.createElement("div");
  tabStrip.className = "dashboard-tab-strip";
  const addTab = (
    id: "react" | "flow" | "network" | "keys",
    label: string,
  ): void => {
    const tab = document.createElement("button");
    tab.className = `dashboard-tab${activeTab === id ? " active" : ""}`;
    tab.textContent = label;
    tab.addEventListener("click", () => onTabChange(id));
    tabStrip.appendChild(tab);
  };
  if (hasReactTracer) addTab("react", "React");
  if (hasFlowTracer) addTab("flow", "Flow");
  if (network.available) addTab("network", "Network");
  addTab("keys", "Keys");

  if (hasReactTracer) {
    const reactSection = document.createElement("div");
    reactSection.className = "dashboard-tracer-section";
    reactSection.style.display = activeTab === "react" ? "" : "none";

    const reactName = document.createElement("div");
    reactName.className = "dashboard-tracer-name";
    reactName.textContent = "ReactTracer";

    const reactBtn = document.createElement("button");
    reactBtn.className = `dashboard-button ${reactRunning ? "running" : ""}`;
    reactBtn.textContent = reactRunning ? "Stop" : "Start";
    reactBtn.addEventListener("click", onToggleReact);

    const reactCheckbox = document.createElement("label");
    reactCheckbox.className = "dashboard-checkbox-label";
    const reactCheckboxInput = document.createElement("input");
    reactCheckboxInput.type = "checkbox";
    reactCheckboxInput.checked = reactEnabledOnLoad;
    reactCheckboxInput.addEventListener("change", () => {
      onReactEnabledOnLoadChange(reactCheckboxInput.checked);
    });
    reactCheckbox.appendChild(reactCheckboxInput);
    reactCheckbox.appendChild(document.createTextNode(" Enable on load"));

    const reactAutoStopGroup = document.createElement("div");
    reactAutoStopGroup.className = "dashboard-input-group";
    const reactAutoStopCheckbox = document.createElement("input");
    reactAutoStopCheckbox.type = "checkbox";
    reactAutoStopCheckbox.checked = reactAutoStopRenders !== null;
    const reactAutoStopLabel = document.createElement("label");
    reactAutoStopLabel.textContent = "Auto-stop after";
    reactAutoStopLabel.style.cursor = "pointer";
    reactAutoStopLabel.addEventListener("click", () => {
      reactAutoStopCheckbox.click();
    });
    const reactAutoStopInput = document.createElement("input");
    reactAutoStopInput.type = "number";
    reactAutoStopInput.min = "1";
    reactAutoStopInput.value =
      reactAutoStopRenders !== null
        ? String(reactAutoStopRenders)
        : String(DEFAULT_AUTOSTOP_REACT_RENDERS);
    reactAutoStopInput.disabled = reactAutoStopRenders === null;
    reactAutoStopCheckbox.addEventListener("change", () => {
      if (reactAutoStopCheckbox.checked) {
        const value =
          parseInt(reactAutoStopInput.value, 10) ||
          DEFAULT_AUTOSTOP_REACT_RENDERS;
        reactAutoStopInput.disabled = false;
        onReactAutoStopChange(value);
      } else {
        reactAutoStopInput.disabled = true;
        onReactAutoStopChange(null);
      }
    });
    reactAutoStopInput.addEventListener("change", () => {
      const value = parseInt(reactAutoStopInput.value, 10);
      if (value > 0) {
        onReactAutoStopChange(value);
      }
    });
    const reactAutoStopUnit = document.createTextNode(" renders");
    reactAutoStopGroup.appendChild(reactAutoStopCheckbox);
    reactAutoStopGroup.appendChild(reactAutoStopLabel);
    reactAutoStopGroup.appendChild(reactAutoStopInput);
    reactAutoStopGroup.appendChild(reactAutoStopUnit);

    // React trigger controls
    const reactTriggerHeader = document.createElement("div");
    reactTriggerHeader.className = "dashboard-section-header";
    reactTriggerHeader.textContent = "Triggers (Debug)";

    const reactStartTriggerGroup = document.createElement("div");
    reactStartTriggerGroup.className = "dashboard-input-group";
    const reactStartTriggerLabel = document.createElement("label");
    reactStartTriggerLabel.textContent = "Start when:";
    reactStartTriggerLabel.style.display = "block";
    reactStartTriggerLabel.style.marginBottom = "4px";
    const reactStartTriggerInput = document.createElement("input");
    reactStartTriggerInput.type = "text";
    reactStartTriggerInput.placeholder = "e.g., UserDashboard or User*";
    reactStartTriggerInput.value = reactStartTrigger ?? "";
    reactStartTriggerInput.style.width = "100%";
    reactStartTriggerInput.addEventListener("input", () => {
      const value = reactStartTriggerInput.value.trim();
      onReactStartTriggerChange(value.length > 0 ? value : null);
    });
    reactStartTriggerGroup.appendChild(reactStartTriggerLabel);
    reactStartTriggerGroup.appendChild(reactStartTriggerInput);

    const reactEndTriggerGroup = document.createElement("div");
    reactEndTriggerGroup.className = "dashboard-input-group";
    const reactEndTriggerLabel = document.createElement("label");
    reactEndTriggerLabel.textContent = "Stop when:";
    reactEndTriggerLabel.style.display = "block";
    reactEndTriggerLabel.style.marginBottom = "4px";
    const reactEndTriggerInput = document.createElement("input");
    reactEndTriggerInput.type = "text";
    reactEndTriggerInput.placeholder = "e.g., LogoutPage or *Modal";
    reactEndTriggerInput.value = reactEndTrigger ?? "";
    reactEndTriggerInput.style.width = "100%";
    reactEndTriggerInput.addEventListener("input", () => {
      const value = reactEndTriggerInput.value.trim();
      onReactEndTriggerChange(value.length > 0 ? value : null);
    });
    reactEndTriggerGroup.appendChild(reactEndTriggerLabel);
    reactEndTriggerGroup.appendChild(reactEndTriggerInput);

    const reactTriggerModesGroup = document.createElement("div");
    reactTriggerModesGroup.className = "dashboard-input-group";
    reactTriggerModesGroup.style.display = "flex";
    reactTriggerModesGroup.style.gap = "10px";

    const reactEndModeWrapper = document.createElement("div");
    reactEndModeWrapper.style.flex = "1";
    const reactEndModeLabel = document.createElement("label");
    reactEndModeLabel.textContent = "Stop timing:";
    reactEndModeLabel.style.display = "block";
    reactEndModeLabel.style.marginBottom = "4px";
    const reactEndModeSelect = document.createElement("select");
    reactEndModeSelect.style.width = "100%";
    const reactEndModeEntry = document.createElement("option");
    reactEndModeEntry.value = "on-entry";
    reactEndModeEntry.textContent = "On Entry";
    const reactEndModeExit = document.createElement("option");
    reactEndModeExit.value = "on-exit";
    reactEndModeExit.textContent = "On Exit";
    reactEndModeSelect.appendChild(reactEndModeEntry);
    reactEndModeSelect.appendChild(reactEndModeExit);
    reactEndModeSelect.value = reactEndTriggerMode;
    reactEndModeSelect.addEventListener("change", () => {
      onReactEndTriggerModeChange(
        reactEndModeSelect.value as "on-entry" | "on-exit",
      );
    });
    reactEndModeWrapper.appendChild(reactEndModeLabel);
    reactEndModeWrapper.appendChild(reactEndModeSelect);

    const reactRearmWrapper = document.createElement("div");
    reactRearmWrapper.style.flex = "1";
    const reactRearmLabel = document.createElement("label");
    reactRearmLabel.textContent = "Auto-start:";
    reactRearmLabel.style.display = "block";
    reactRearmLabel.style.marginBottom = "4px";
    const reactRearmSelect = document.createElement("select");
    reactRearmSelect.style.width = "100%";
    const reactRearmAlways = document.createElement("option");
    reactRearmAlways.value = "always";
    reactRearmAlways.textContent = "Always";
    const reactRearmOnce = document.createElement("option");
    reactRearmOnce.value = "once";
    reactRearmOnce.textContent = "Once";
    reactRearmSelect.appendChild(reactRearmAlways);
    reactRearmSelect.appendChild(reactRearmOnce);
    reactRearmSelect.value = reactTriggerRearmMode;
    reactRearmSelect.addEventListener("change", () => {
      onReactTriggerRearmModeChange(
        reactRearmSelect.value as "always" | "once",
      );
    });
    reactRearmWrapper.appendChild(reactRearmLabel);
    reactRearmWrapper.appendChild(reactRearmSelect);

    reactTriggerModesGroup.appendChild(reactEndModeWrapper);
    reactTriggerModesGroup.appendChild(reactRearmWrapper);

    const reactClearTriggersButton = document.createElement("button");
    reactClearTriggersButton.className = "dashboard-btn";
    reactClearTriggersButton.textContent = "Clear All Triggers";
    reactClearTriggersButton.style.width = "100%";
    reactClearTriggersButton.style.marginTop = "8px";
    reactClearTriggersButton.addEventListener("click", () => {
      onReactClearTriggers();
      reactStartTriggerInput.value = "";
      reactEndTriggerInput.value = "";
      reactEndModeSelect.value = "on-exit";
      reactRearmSelect.value = "once";
    });

    reactSection.appendChild(reactName);
    reactSection.appendChild(reactBtn);
    reactSection.appendChild(reactCheckbox);
    reactSection.appendChild(reactAutoStopGroup);
    reactSection.appendChild(reactTriggerHeader);
    reactSection.appendChild(reactStartTriggerGroup);
    reactSection.appendChild(reactEndTriggerGroup);
    reactSection.appendChild(reactTriggerModesGroup);
    reactSection.appendChild(reactClearTriggersButton);
    scrollContent.appendChild(reactSection);
  }

  // Flow tracer section
  if (hasFlowTracer) {
    const flowSection = document.createElement("div");
    flowSection.className = "dashboard-tracer-section";
    flowSection.style.display = activeTab === "flow" ? "" : "none";

    const flowName = document.createElement("div");
    flowName.className = "dashboard-tracer-name";
    flowName.textContent = "Flow Tracer";

    const flowBtn = document.createElement("button");
    flowBtn.className = `dashboard-button ${flowRunning ? "running" : ""}`;
    flowBtn.textContent = flowRunning ? "Stop" : "Start";
    flowBtn.addEventListener("click", onToggleFlow);

    const flowCheckbox = document.createElement("label");
    flowCheckbox.className = "dashboard-checkbox-label";
    const flowCheckboxInput = document.createElement("input");
    flowCheckboxInput.type = "checkbox";
    flowCheckboxInput.checked = flowEnabledOnLoad;
    flowCheckboxInput.addEventListener("change", () => {
      onFlowEnabledOnLoadChange(flowCheckboxInput.checked);
    });
    flowCheckbox.appendChild(flowCheckboxInput);
    flowCheckbox.appendChild(document.createTextNode(" Enable on load"));

    const flowAutoStopTopLevelGroup = document.createElement("div");
    flowAutoStopTopLevelGroup.className = "dashboard-input-group";
    const flowTopLevelCheckbox = document.createElement("input");
    flowTopLevelCheckbox.type = "checkbox";
    flowTopLevelCheckbox.checked = flowAutoStopTopLevel !== null;
    const flowTopLevelLabel = document.createElement("label");
    flowTopLevelLabel.textContent = "Auto-stop after";
    flowTopLevelLabel.style.cursor = "pointer";
    flowTopLevelLabel.addEventListener("click", () => {
      flowTopLevelCheckbox.click();
    });
    const flowTopLevelInput = document.createElement("input");
    flowTopLevelInput.type = "number";
    flowTopLevelInput.min = "1";
    flowTopLevelInput.value =
      flowAutoStopTopLevel !== null
        ? String(flowAutoStopTopLevel)
        : String(DEFAULT_AUTOSTOP_FLOW_TOPLEVEL);
    flowTopLevelInput.disabled = flowAutoStopTopLevel === null;
    flowTopLevelCheckbox.addEventListener("change", () => {
      if (flowTopLevelCheckbox.checked) {
        const value =
          parseInt(flowTopLevelInput.value, 10) ||
          DEFAULT_AUTOSTOP_FLOW_TOPLEVEL;
        flowTopLevelInput.disabled = false;
        onFlowAutoStopTopLevelChange(value);
      } else {
        flowTopLevelInput.disabled = true;
        onFlowAutoStopTopLevelChange(null);
      }
    });
    flowTopLevelInput.addEventListener("change", () => {
      const value = parseInt(flowTopLevelInput.value, 10);
      if (value > 0) {
        onFlowAutoStopTopLevelChange(value);
      }
    });
    const flowTopLevelUnit = document.createTextNode(" top-level");
    flowAutoStopTopLevelGroup.appendChild(flowTopLevelCheckbox);
    flowAutoStopTopLevelGroup.appendChild(flowTopLevelLabel);
    flowAutoStopTopLevelGroup.appendChild(flowTopLevelInput);
    flowAutoStopTopLevelGroup.appendChild(flowTopLevelUnit);

    const flowAutoStopAllGroup = document.createElement("div");
    flowAutoStopAllGroup.className = "dashboard-input-group";
    const flowAllCheckbox = document.createElement("input");
    flowAllCheckbox.type = "checkbox";
    flowAllCheckbox.checked = flowAutoStopAll !== null;
    const flowAllLabel = document.createElement("label");
    flowAllLabel.textContent = "Auto-stop after";
    flowAllLabel.style.cursor = "pointer";
    flowAllLabel.addEventListener("click", () => {
      flowAllCheckbox.click();
    });
    const flowAllInput = document.createElement("input");
    flowAllInput.type = "number";
    flowAllInput.min = "1";
    flowAllInput.value =
      flowAutoStopAll !== null
        ? String(flowAutoStopAll)
        : String(DEFAULT_AUTOSTOP_FLOW_TOTAL);
    flowAllInput.disabled = flowAutoStopAll === null;
    flowAllCheckbox.addEventListener("change", () => {
      if (flowAllCheckbox.checked) {
        const value =
          parseInt(flowAllInput.value, 10) || DEFAULT_AUTOSTOP_FLOW_TOTAL;
        flowAllInput.disabled = false;
        onFlowAutoStopAllChange(value);
      } else {
        flowAllInput.disabled = true;
        onFlowAutoStopAllChange(null);
      }
    });
    flowAllInput.addEventListener("change", () => {
      const value = parseInt(flowAllInput.value, 10);
      if (value > 0) {
        onFlowAutoStopAllChange(value);
      }
    });
    const flowAllUnit = document.createTextNode(" total");
    flowAutoStopAllGroup.appendChild(flowAllCheckbox);
    flowAutoStopAllGroup.appendChild(flowAllLabel);
    flowAutoStopAllGroup.appendChild(flowAllInput);
    flowAutoStopAllGroup.appendChild(flowAllUnit);

    // Flow trigger controls
    const flowTriggerHeader = document.createElement("div");
    flowTriggerHeader.className = "dashboard-section-header";
    flowTriggerHeader.textContent = "Triggers (Debug)";

    const flowStartTriggerGroup = document.createElement("div");
    flowStartTriggerGroup.className = "dashboard-input-group";
    const flowStartTriggerLabel = document.createElement("label");
    flowStartTriggerLabel.textContent = "Start when:";
    flowStartTriggerLabel.style.display = "block";
    flowStartTriggerLabel.style.marginBottom = "4px";
    const flowStartTriggerInput = document.createElement("input");
    flowStartTriggerInput.type = "text";
    flowStartTriggerInput.placeholder = "e.g., processData or process*";
    flowStartTriggerInput.value = flowStartTrigger ?? "";
    flowStartTriggerInput.style.width = "100%";
    flowStartTriggerInput.addEventListener("input", () => {
      const value = flowStartTriggerInput.value.trim();
      onFlowStartTriggerChange(value.length > 0 ? value : null);
    });
    flowStartTriggerGroup.appendChild(flowStartTriggerLabel);
    flowStartTriggerGroup.appendChild(flowStartTriggerInput);

    const flowEndTriggerGroup = document.createElement("div");
    flowEndTriggerGroup.className = "dashboard-input-group";
    const flowEndTriggerLabel = document.createElement("label");
    flowEndTriggerLabel.textContent = "Stop when:";
    flowEndTriggerLabel.style.display = "block";
    flowEndTriggerLabel.style.marginBottom = "4px";
    const flowEndTriggerInput = document.createElement("input");
    flowEndTriggerInput.type = "text";
    flowEndTriggerInput.placeholder = "e.g., finalize* or complete";
    flowEndTriggerInput.value = flowEndTrigger ?? "";
    flowEndTriggerInput.style.width = "100%";
    flowEndTriggerInput.addEventListener("input", () => {
      const value = flowEndTriggerInput.value.trim();
      onFlowEndTriggerChange(value.length > 0 ? value : null);
    });
    flowEndTriggerGroup.appendChild(flowEndTriggerLabel);
    flowEndTriggerGroup.appendChild(flowEndTriggerInput);

    const flowTriggerModesGroup = document.createElement("div");
    flowTriggerModesGroup.className = "dashboard-input-group";
    flowTriggerModesGroup.style.display = "flex";
    flowTriggerModesGroup.style.gap = "10px";

    const flowEndModeWrapper = document.createElement("div");
    flowEndModeWrapper.style.flex = "1";
    const flowEndModeLabel = document.createElement("label");
    flowEndModeLabel.textContent = "Stop timing:";
    flowEndModeLabel.style.display = "block";
    flowEndModeLabel.style.marginBottom = "4px";
    const flowEndModeSelect = document.createElement("select");
    flowEndModeSelect.style.width = "100%";
    const flowEndModeEntry = document.createElement("option");
    flowEndModeEntry.value = "on-entry";
    flowEndModeEntry.textContent = "On Entry";
    const flowEndModeExit = document.createElement("option");
    flowEndModeExit.value = "on-exit";
    flowEndModeExit.textContent = "On Exit";
    flowEndModeSelect.appendChild(flowEndModeEntry);
    flowEndModeSelect.appendChild(flowEndModeExit);
    flowEndModeSelect.value = flowEndTriggerMode;
    flowEndModeSelect.addEventListener("change", () => {
      onFlowEndTriggerModeChange(
        flowEndModeSelect.value as "on-entry" | "on-exit",
      );
    });
    flowEndModeWrapper.appendChild(flowEndModeLabel);
    flowEndModeWrapper.appendChild(flowEndModeSelect);

    const flowRearmWrapper = document.createElement("div");
    flowRearmWrapper.style.flex = "1";
    const flowRearmLabel = document.createElement("label");
    flowRearmLabel.textContent = "Auto-start:";
    flowRearmLabel.style.display = "block";
    flowRearmLabel.style.marginBottom = "4px";
    const flowRearmSelect = document.createElement("select");
    flowRearmSelect.style.width = "100%";
    const flowRearmAlways = document.createElement("option");
    flowRearmAlways.value = "always";
    flowRearmAlways.textContent = "Always";
    const flowRearmOnce = document.createElement("option");
    flowRearmOnce.value = "once";
    flowRearmOnce.textContent = "Once";
    flowRearmSelect.appendChild(flowRearmAlways);
    flowRearmSelect.appendChild(flowRearmOnce);
    flowRearmSelect.value = flowTriggerRearmMode;
    flowRearmSelect.addEventListener("change", () => {
      onFlowTriggerRearmModeChange(flowRearmSelect.value as "always" | "once");
    });
    flowRearmWrapper.appendChild(flowRearmLabel);
    flowRearmWrapper.appendChild(flowRearmSelect);

    flowTriggerModesGroup.appendChild(flowEndModeWrapper);
    flowTriggerModesGroup.appendChild(flowRearmWrapper);

    const flowClearTriggersButton = document.createElement("button");
    flowClearTriggersButton.className = "dashboard-btn";
    flowClearTriggersButton.textContent = "Clear All Triggers";
    flowClearTriggersButton.style.width = "100%";
    flowClearTriggersButton.style.marginTop = "8px";
    flowClearTriggersButton.addEventListener("click", () => {
      onFlowClearTriggers();
      flowStartTriggerInput.value = "";
      flowEndTriggerInput.value = "";
      flowEndModeSelect.value = "on-exit";
      flowRearmSelect.value = "once";
    });

    flowSection.appendChild(flowName);
    flowSection.appendChild(flowBtn);
    flowSection.appendChild(flowCheckbox);
    flowSection.appendChild(flowAutoStopTopLevelGroup);
    flowSection.appendChild(flowAutoStopAllGroup);
    flowSection.appendChild(flowTriggerHeader);
    flowSection.appendChild(flowStartTriggerGroup);
    flowSection.appendChild(flowEndTriggerGroup);
    flowSection.appendChild(flowTriggerModesGroup);
    flowSection.appendChild(flowClearTriggersButton);
    scrollContent.appendChild(flowSection);
  }

  if (network.available) {
    const networkSection = document.createElement("div");
    networkSection.className = "dashboard-tracer-section";
    networkSection.style.display = activeTab === "network" ? "" : "none";

    const networkName = document.createElement("div");
    networkName.className = "dashboard-tracer-name";
    networkName.textContent = "NetworkTracer";

    const networkButton = document.createElement("button");
    networkButton.className = `dashboard-button ${network.state === "running" ? "running" : ""}`;
    networkButton.textContent = network.state === "running" ? "Stop" : "Start";
    networkButton.addEventListener("click", network.toggle);

    networkSection.appendChild(networkName);
    networkSection.appendChild(networkButton);
    networkSection.appendChild(
      createNetworkCheckbox(
        "Enable on load",
        network.enabledOnLoad,
        network.setEnabledOnLoad,
      ),
    );
    networkSection.appendChild(
      createNetworkCheckbox(
        "Capture request headers",
        network.captureRequestHeaders,
        network.setCaptureRequestHeaders,
      ),
    );
    networkSection.appendChild(
      createNetworkCheckbox(
        "Capture request body",
        network.captureRequestBody,
        network.setCaptureRequestBody,
      ),
    );
    networkSection.appendChild(
      createNetworkCheckbox(
        "Capture response headers",
        network.captureResponseHeaders,
        network.setCaptureResponseHeaders,
      ),
    );
    networkSection.appendChild(
      createNetworkCheckbox(
        "Capture response body",
        network.captureResponseBody,
        network.setCaptureResponseBody,
      ),
    );

    const advanced = document.createElement("details");
    advanced.className = "dashboard-advanced";
    const advancedSummary = document.createElement("summary");
    advancedSummary.className = "dashboard-advanced-summary";
    advancedSummary.textContent = "Advanced";
    advanced.appendChild(advancedSummary);

    const advancedContent = document.createElement("div");
    advancedContent.className = "dashboard-advanced-content";

    const bodyLimitGroup = document.createElement("div");
    bodyLimitGroup.className = "dashboard-input-group";
    const bodyLimitLabel = document.createElement("label");
    bodyLimitLabel.textContent = "Body capture limit";
    const bodyLimitInput = document.createElement("input");
    bodyLimitInput.type = "number";
    bodyLimitInput.value = String(network.bodyCaptureLimit);
    const bodyLimitError = document.createElement("span");
    bodyLimitInput.addEventListener(
      "change",
      createPositiveIntegerChangeHandler(
        bodyLimitInput,
        bodyLimitError,
        network.setBodyCaptureLimit,
      ),
    );
    bodyLimitGroup.appendChild(bodyLimitLabel);
    bodyLimitGroup.appendChild(bodyLimitInput);
    bodyLimitGroup.appendChild(bodyLimitError);
    advancedContent.appendChild(bodyLimitGroup);

    advancedContent.appendChild(
      createNetworkCheckbox(
        "Wait for pending requests on manual stop",
        network.waitForPendingRequestsOnStop,
        network.setWaitForPendingRequestsOnStop,
      ),
    );

    const autoStopGroup = document.createElement("div");
    autoStopGroup.className = "dashboard-input-group";
    const autoStopLabel = document.createElement("label");
    autoStopLabel.textContent = "Automatic stop request limit";
    const autoStopInput = document.createElement("input");
    autoStopInput.type = "number";
    autoStopInput.value =
      network.autoStopAfterRequests === undefined
        ? ""
        : String(network.autoStopAfterRequests);
    const autoStopError = document.createElement("span");
    autoStopInput.addEventListener(
      "change",
      createOptionalPositiveIntegerChangeHandler(
        autoStopInput,
        autoStopError,
        network.setAutoStopAfterRequests,
      ),
    );
    autoStopGroup.appendChild(autoStopLabel);
    autoStopGroup.appendChild(autoStopInput);
    autoStopGroup.appendChild(autoStopError);
    advancedContent.appendChild(autoStopGroup);

    const redactionGroup = document.createElement("div");
    redactionGroup.className = "dashboard-textarea-group";
    const redactionLabel = document.createElement("label");
    redactionLabel.htmlFor = "dashboard-network-redaction-patterns";
    redactionLabel.textContent = "Redaction patterns";
    const redactionInput = document.createElement("textarea");
    redactionInput.id = "dashboard-network-redaction-patterns";
    redactionInput.setAttribute("aria-label", "Redaction patterns");
    redactionInput.value = network.redactionPatterns.join("\n");
    redactionInput.addEventListener("change", () =>
      network.setRedactionPatterns(
        redactionInput.value
          .split(/\r?\n/u)
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
      ),
    );
    redactionGroup.appendChild(redactionLabel);
    redactionGroup.appendChild(redactionInput);
    advancedContent.appendChild(redactionGroup);

    const includeGroup = document.createElement("div");
    includeGroup.className = "dashboard-textarea-group";
    const includeLabel = document.createElement("label");
    includeLabel.htmlFor = "dashboard-network-include-patterns";
    includeLabel.textContent = "Include URL globs";
    const includeInput = document.createElement("textarea");
    includeInput.id = "dashboard-network-include-patterns";
    includeInput.setAttribute("aria-label", "Include URL globs");
    includeInput.value = network.includePatterns.join("\n");
    const includeError = document.createElement("span");
    includeInput.addEventListener(
      "change",
      createGlobListChangeHandler(
        includeInput,
        includeError,
        network.setIncludePatterns,
      ),
    );
    includeGroup.appendChild(includeLabel);
    includeGroup.appendChild(includeInput);
    includeGroup.appendChild(includeError);
    advancedContent.appendChild(includeGroup);

    const excludeGroup = document.createElement("div");
    excludeGroup.className = "dashboard-textarea-group";
    const excludeLabel = document.createElement("label");
    excludeLabel.htmlFor = "dashboard-network-exclude-patterns";
    excludeLabel.textContent = "Exclude URL globs";
    const excludeInput = document.createElement("textarea");
    excludeInput.id = "dashboard-network-exclude-patterns";
    excludeInput.setAttribute("aria-label", "Exclude URL globs");
    excludeInput.value = network.excludePatterns.join("\n");
    const excludeError = document.createElement("span");
    excludeInput.addEventListener(
      "change",
      createGlobListChangeHandler(
        excludeInput,
        excludeError,
        network.setExcludePatterns,
      ),
    );
    excludeGroup.appendChild(excludeLabel);
    excludeGroup.appendChild(excludeInput);
    excludeGroup.appendChild(excludeError);
    advancedContent.appendChild(excludeGroup);

    const resetConfigButton = document.createElement("button");
    resetConfigButton.className = "dashboard-btn dashboard-reset-button";
    resetConfigButton.textContent = "Reset configuration";
    resetConfigButton.addEventListener("click", network.resetConfig);
    advancedContent.appendChild(resetConfigButton);
    advanced.appendChild(advancedContent);
    networkSection.appendChild(advanced);

    if (network.state === "stopping") {
      const stoppingStatus = document.createElement("div");
      stoppingStatus.textContent = `Stopping (${network.pendingRequestCount} pending)`;
      const stopNow = document.createElement("button");
      stopNow.className = "dashboard-button";
      stopNow.textContent = "Stop now";
      stopNow.addEventListener("click", network.forceStop);
      networkSection.appendChild(stoppingStatus);
      networkSection.appendChild(stopNow);
    }
    scrollContent.appendChild(networkSection);
  }

  // Hotkeys section
  const hotkeysSection = document.createElement("div");
  hotkeysSection.className = "dashboard-hotkeys";
  hotkeysSection.style.display = activeTab === "keys" ? "" : "none";

  const hotkeysTitle = document.createElement("div");
  hotkeysTitle.className = "dashboard-hotkeys-title";
  hotkeysTitle.textContent = "Keyboard Shortcuts";
  hotkeysSection.appendChild(hotkeysTitle);

  const toggleTracingItem = document.createElement("div");
  toggleTracingItem.className = "dashboard-hotkey-item";
  const toggleTracingLabel = document.createElement("span");
  toggleTracingLabel.className = "dashboard-hotkey-label";
  toggleTracingLabel.textContent = "Toggle Tracing";
  const toggleTracingKeys = document.createElement("span");
  toggleTracingKeys.className = "dashboard-hotkey-keys";
  toggleTracingKeys.textContent = hotkeys.toggleTracing;
  toggleTracingItem.appendChild(toggleTracingLabel);
  toggleTracingItem.appendChild(toggleTracingKeys);
  hotkeysSection.appendChild(toggleTracingItem);

  const toggleDashboardItem = document.createElement("div");
  toggleDashboardItem.className = "dashboard-hotkey-item";
  const toggleDashboardLabel = document.createElement("span");
  toggleDashboardLabel.className = "dashboard-hotkey-label";
  toggleDashboardLabel.textContent = "Toggle Dashboard";
  const toggleDashboardKeys = document.createElement("span");
  toggleDashboardKeys.className = "dashboard-hotkey-keys";
  toggleDashboardKeys.textContent = hotkeys.toggleDashboard;
  toggleDashboardItem.appendChild(toggleDashboardLabel);
  toggleDashboardItem.appendChild(toggleDashboardKeys);
  hotkeysSection.appendChild(toggleDashboardItem);

  scrollContent.appendChild(hotkeysSection);

  // Tab strip at the bottom
  expanded.appendChild(tabStrip);

  return expanded;
};

/**
 * Dashboard widget managing UI state and DOM.
 */
export class DashboardWidget {
  private readonly config: NormalizedDashboardConfig;
  private readonly container: HTMLDivElement;
  private isExpanded: boolean = false;
  private isVisible: boolean = false;
  private activeTab: "react" | "flow" | "network" | "keys" | null = null;
  private clickAwayListener: ((event: MouseEvent) => void) | null = null;
  private statePollingInterval: number | null = null;
  private lastKnownState: {
    hasReactTracer: boolean;
    hasFlowTracer: boolean;
    hasNetworkTracer: boolean;
    networkState: "stopped" | "running" | "stopping";
    networkPendingRequestCount: number;
    reactRunning: boolean;
    flowRunning: boolean;
  } = {
    hasReactTracer: false,
    hasFlowTracer: false,
    hasNetworkTracer: false,
    networkState: "stopped",
    networkPendingRequestCount: 0,
    reactRunning: false,
    flowRunning: false,
  };

  /**
   * Create a new dashboard widget.
   *
   * @param config - Normalized dashboard configuration.
   */
  constructor(config: NormalizedDashboardConfig) {
    this.config = config;
    this.container = document.createElement("div");
    this.container.className = `autotracer-dashboard ${getPositionClass(config.position)}`;

    // Inject styles
    injectStyles(isDarkMode());

    // Initialize visibility based on config and localStorage
    this.initializeVisibility();

    // Render initial state
    this.render();

    // Start polling to detect state changes (including late tracer initialization)
    this.startStatePolling();
  }

  /**
   * Start polling for tracer state changes.
   */
  private startStatePolling(): void {
    // Update initial state
    this.lastKnownState = {
      hasReactTracer: this.hasReactTracer(),
      hasFlowTracer: this.hasFlowTracer(),
      hasNetworkTracer: this.hasNetworkTracer(),
      networkState: this.getNetworkTracerState(),
      networkPendingRequestCount: this.getNetworkPendingRequestCount(),
      reactRunning: this.isReactTracerRunning(),
      flowRunning: this.isFlowTracerRunning(),
    };

    // Poll every 500ms for tracer running state changes
    // Note: Trigger values are not polled because they are only changed through
    // the dashboard UI. Polling them would cause the widget to re-render while
    // the user is typing, destroying the input elements and making them unusable.
    this.statePollingInterval = window.setInterval(() => {
      const currentState = {
        hasReactTracer: this.hasReactTracer(),
        hasFlowTracer: this.hasFlowTracer(),
        hasNetworkTracer: this.hasNetworkTracer(),
        networkState: this.getNetworkTracerState(),
        networkPendingRequestCount: this.getNetworkPendingRequestCount(),
        reactRunning: this.isReactTracerRunning(),
        flowRunning: this.isFlowTracerRunning(),
      };

      // Check if state changed
      if (
        currentState.hasReactTracer !== this.lastKnownState.hasReactTracer ||
        currentState.hasFlowTracer !== this.lastKnownState.hasFlowTracer ||
        currentState.hasNetworkTracer !==
          this.lastKnownState.hasNetworkTracer ||
        currentState.networkState !== this.lastKnownState.networkState ||
        currentState.networkPendingRequestCount !==
          this.lastKnownState.networkPendingRequestCount ||
        currentState.reactRunning !== this.lastKnownState.reactRunning ||
        currentState.flowRunning !== this.lastKnownState.flowRunning
      ) {
        this.clearUnavailableActiveTab(
          currentState.hasReactTracer,
          currentState.hasFlowTracer,
          currentState.hasNetworkTracer,
        );
        this.lastKnownState = currentState;
        this.render();
      }
    }, 500);
  }

  /**
   * Stop polling for tracer state changes.
   */
  private stopStatePolling(): void {
    if (this.statePollingInterval !== null) {
      clearInterval(this.statePollingInterval);
      this.statePollingInterval = null;
    }
  }

  /**
   * Initialize widget visibility based on configuration and localStorage.
   */
  private initializeVisibility(): void {
    if (hasBeenShown()) {
      this.isVisible = true;
    } else if (!this.config.hideByDefault) {
      this.isVisible = true;
    } else {
      this.isVisible = false;
    }

    if (!this.isVisible) {
      this.container.classList.add("dashboard-hidden");
    }
  }

  /**
   * Render widget DOM.
   */
  private render(): void {
    // Clear container
    this.container.innerHTML = "";

    if (this.isExpanded) {
      const expanded = createExpandedWidget(
        () => this.collapse(),
        () => this.toggleReactTracer(),
        () => this.toggleFlowTracer(),
        (enabled) => this.setReactEnabledOnLoad(enabled),
        (enabled) => this.setFlowEnabledOnLoad(enabled),
        (limit) => this.setReactAutoStopRenders(limit),
        (limit) => this.setFlowAutoStopTopLevel(limit),
        (limit) => this.setFlowAutoStopAll(limit),
        (pattern) => this.setReactStartTrigger(pattern),
        (pattern) => this.setReactEndTrigger(pattern),
        (mode) => this.setReactEndTriggerMode(mode),
        (mode) => this.setReactTriggerRearmMode(mode),
        () => this.clearReactTriggers(),
        (pattern) => this.setFlowStartTrigger(pattern),
        (pattern) => this.setFlowEndTrigger(pattern),
        (mode) => this.setFlowEndTriggerMode(mode),
        (mode) => this.setFlowTriggerRearmMode(mode),
        () => this.clearFlowTriggers(),
        this.isReactTracerRunning(),
        this.isFlowTracerRunning(),
        this.getReactEnabledOnLoad(),
        this.getFlowEnabledOnLoad(),
        this.getReactAutoStopRenders(),
        this.getFlowAutoStopTopLevel(),
        this.getFlowAutoStopAll(),
        this.getReactStartTrigger(),
        this.getReactEndTrigger(),
        this.getReactEndTriggerMode(),
        this.getReactTriggerRearmMode(),
        this.getFlowStartTrigger(),
        this.getFlowEndTrigger(),
        this.getFlowEndTriggerMode(),
        this.getFlowTriggerRearmMode(),
        this.hasReactTracer(),
        this.hasFlowTracer(),
        {
          available: this.hasNetworkTracer(),
          state: this.getNetworkTracerState(),
          pendingRequestCount: this.getNetworkPendingRequestCount(),
          enabledOnLoad: this.getNetworkEnabledOnLoad(),
          captureRequestHeaders: this.getNetworkCaptureRequestHeaders(),
          captureRequestBody: this.getNetworkCaptureRequestBody(),
          captureResponseHeaders: this.getNetworkCaptureResponseHeaders(),
          captureResponseBody: this.getNetworkCaptureResponseBody(),
          bodyCaptureLimit: this.getNetworkBodyCaptureLimit(),
          waitForPendingRequestsOnStop:
            this.getNetworkWaitForPendingRequestsOnStop(),
          autoStopAfterRequests: this.getNetworkAutoStopAfterRequests(),
          redactionPatterns: this.getNetworkRedactionPatterns(),
          includePatterns: this.getNetworkIncludePatterns(),
          excludePatterns: this.getNetworkExcludePatterns(),
          toggle: () => this.toggleNetworkTracer(),
          forceStop: () => this.forceStopNetworkTracer(),
          setEnabledOnLoad: (value) => this.setNetworkEnabledOnLoad(value),
          setCaptureRequestHeaders: (value) =>
            this.setNetworkCaptureRequestHeaders(value),
          setCaptureRequestBody: (value) =>
            this.setNetworkCaptureRequestBody(value),
          setCaptureResponseHeaders: (value) =>
            this.setNetworkCaptureResponseHeaders(value),
          setCaptureResponseBody: (value) =>
            this.setNetworkCaptureResponseBody(value),
          setBodyCaptureLimit: (value) =>
            this.setNetworkBodyCaptureLimit(value),
          setWaitForPendingRequestsOnStop: (value) =>
            this.setNetworkWaitForPendingRequestsOnStop(value),
          setAutoStopAfterRequests: (value) =>
            this.setNetworkAutoStopAfterRequests(value),
          setRedactionPatterns: (value) =>
            this.setNetworkRedactionPatterns(value),
          setIncludePatterns: (value) => this.setNetworkIncludePatterns(value),
          setExcludePatterns: (value) => this.setNetworkExcludePatterns(value),
          resetConfig: () => this.resetNetworkConfig(),
        },
        this.config.hotkeys,
        this.resolveActiveTab(),
        (tab) => this.setActiveTab(tab),
      );
      this.container.appendChild(expanded);
    } else {
      const collapsed = createCollapsedWidget(this.isAnyTracerRunning());
      collapsed.addEventListener("click", () => this.expand());
      this.container.appendChild(collapsed);
    }
  }

  /**
   * Check if React tracer is available.
   */
  private hasReactTracer(): boolean {
    return Boolean(globalThis.autoTracer?.reactTracer);
  }

  /**
   * Check if Flow tracer is available.
   */
  private hasFlowTracer(): boolean {
    return Boolean(globalThis.autoTracer?.flowTracer);
  }

  /**
   * Check if Network tracer is available.
   */
  private hasNetworkTracer(): boolean {
    return Boolean(globalThis.autoTracer?.networkTracer);
  }

  /** Returns the current NetworkTracer lifecycle state. */
  private getNetworkTracerState(): "stopped" | "running" | "stopping" {
    return globalThis.autoTracer?.networkTracer?.getState() ?? "stopped";
  }

  /** Returns the current NetworkTracer pending-work count. */
  private getNetworkPendingRequestCount(): number {
    return globalThis.autoTracer?.networkTracer?.getPendingRequestCount() ?? 0;
  }

  /**
   * Clears an explicit tab selection when its tracer is no longer available.
   *
   * @param hasReactTracer - Whether ReactTracer is currently available.
   * @param hasFlowTracer - Whether FlowTracer is currently available.
   * @param hasNetworkTracer - Whether NetworkTracer is currently available.
   */
  private clearUnavailableActiveTab(
    hasReactTracer: boolean,
    hasFlowTracer: boolean,
    hasNetworkTracer: boolean,
  ): void {
    if (this.activeTab === "react" && !hasReactTracer) {
      this.activeTab = null;
    }
    if (this.activeTab === "flow" && !hasFlowTracer) {
      this.activeTab = null;
    }
    if (this.activeTab === "network" && !hasNetworkTracer) {
      this.activeTab = null;
    }
  }

  /**
   * Resolve active tab, defaulting to the first available tracer tab.
   *
   * @returns Active tab identifier.
   */
  private resolveActiveTab(): "react" | "flow" | "network" | "keys" {
    if (this.activeTab === "keys") return "keys";
    if (this.activeTab === "react" && this.hasReactTracer()) return "react";
    if (this.activeTab === "flow" && this.hasFlowTracer()) return "flow";
    if (this.activeTab === "network" && this.hasNetworkTracer()) {
      return "network";
    }
    if (this.hasReactTracer()) return "react";
    if (this.hasFlowTracer()) return "flow";
    if (this.hasNetworkTracer()) return "network";
    return "keys";
  }

  /**
   * Set active tab and re-render.
   *
   * @param tab - Tab to activate.
   */
  private setActiveTab(tab: "react" | "flow" | "network" | "keys"): void {
    this.activeTab = tab;
    this.render();
  }

  /**
   * Check if React tracer is running.
   */
  private isReactTracerRunning(): boolean {
    return Boolean(globalThis.autoTracer?.reactTracer?.isEnabled());
  }

  /**
   * Check if Flow tracer is running.
   */
  private isFlowTracerRunning(): boolean {
    return Boolean(globalThis.autoTracer?.flowTracer?.isEnabled());
  }

  /**
   * Check if any tracer is currently running.
   * Used for collapsed widget icon color.
   */
  private isAnyTracerRunning(): boolean {
    return this.isReactTracerRunning() || this.isFlowTracerRunning();
  }

  /**
   * Toggle React tracer state.
   */
  private toggleReactTracer(): void {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (!reactTracer) {
      return;
    }

    if (reactTracer.isEnabled()) {
      reactTracer.stop();
    } else {
      reactTracer.start();
      this.markAsShownAndShow();
    }

    this.render();
  }

  /**
   * Toggle Flow tracer state.
   */
  private toggleFlowTracer(): void {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (!flowTracer) {
      return;
    }

    if (flowTracer.isEnabled()) {
      flowTracer.stop();
    } else {
      flowTracer.start();
      this.markAsShownAndShow();
    }

    this.render();
  }

  /** Toggles NetworkTracer between running and stopped states. */
  private toggleNetworkTracer(): void {
    const networkTracer = globalThis.autoTracer?.networkTracer;
    if (networkTracer === undefined) return;
    if (networkTracer.getState() === "running") {
      networkTracer.stop();
    } else {
      networkTracer.start();
      this.markAsShownAndShow();
    }
    this.render();
  }

  /** Immediately stops a draining NetworkTracer session. */
  private forceStopNetworkTracer(): void {
    globalThis.autoTracer?.networkTracer?.forceStop();
    this.render();
  }

  /** Returns NetworkTracer enabled-on-load state. */
  private getNetworkEnabledOnLoad(): boolean {
    return globalThis.autoTracer?.networkTracer?.getEnabledOnLoad?.() ?? false;
  }

  /** Persists NetworkTracer enabled-on-load state. */
  private setNetworkEnabledOnLoad(value: boolean): void {
    globalThis.autoTracer?.networkTracer?.setEnabledOnLoad?.(value);
  }

  /** Returns request-header capture state. */
  private getNetworkCaptureRequestHeaders(): boolean {
    return (
      globalThis.autoTracer?.networkTracer?.getCaptureRequestHeaders?.() ??
      false
    );
  }

  /** Persists request-header capture state. */
  private setNetworkCaptureRequestHeaders(value: boolean): void {
    globalThis.autoTracer?.networkTracer?.setCaptureRequestHeaders?.(value);
  }

  /** Returns request-body capture state. */
  private getNetworkCaptureRequestBody(): boolean {
    return (
      globalThis.autoTracer?.networkTracer?.getCaptureRequestBody?.() ?? false
    );
  }

  /** Persists request-body capture state. */
  private setNetworkCaptureRequestBody(value: boolean): void {
    globalThis.autoTracer?.networkTracer?.setCaptureRequestBody?.(value);
  }

  /** Returns response-header capture state. */
  private getNetworkCaptureResponseHeaders(): boolean {
    return (
      globalThis.autoTracer?.networkTracer?.getCaptureResponseHeaders?.() ??
      false
    );
  }

  /** Persists response-header capture state. */
  private setNetworkCaptureResponseHeaders(value: boolean): void {
    globalThis.autoTracer?.networkTracer?.setCaptureResponseHeaders?.(value);
  }

  /** Returns response-body capture state. */
  private getNetworkCaptureResponseBody(): boolean {
    return (
      globalThis.autoTracer?.networkTracer?.getCaptureResponseBody?.() ?? false
    );
  }

  /** Persists response-body capture state. */
  private setNetworkCaptureResponseBody(value: boolean): void {
    globalThis.autoTracer?.networkTracer?.setCaptureResponseBody?.(value);
  }

  /** Returns the NetworkTracer body capture limit. */
  private getNetworkBodyCaptureLimit(): number {
    return (
      globalThis.autoTracer?.networkTracer?.getBodyCaptureLimit?.() ?? 65_536
    );
  }

  /** Persists the NetworkTracer body capture limit. */
  private setNetworkBodyCaptureLimit(value: number): void {
    globalThis.autoTracer?.networkTracer?.setBodyCaptureLimit?.(value);
  }

  /** Returns the NetworkTracer manual-stop drain policy. */
  private getNetworkWaitForPendingRequestsOnStop(): boolean {
    return (
      globalThis.autoTracer?.networkTracer?.getWaitForPendingRequestsOnStop?.() ??
      false
    );
  }

  /** Persists the NetworkTracer manual-stop drain policy. */
  private setNetworkWaitForPendingRequestsOnStop(value: boolean): void {
    globalThis.autoTracer?.networkTracer?.setWaitForPendingRequestsOnStop?.(
      value,
    );
  }

  /** Returns the NetworkTracer automatic-stop request limit. */
  private getNetworkAutoStopAfterRequests(): number | undefined {
    return globalThis.autoTracer?.networkTracer?.getAutoStopAfterRequests?.();
  }

  /** Persists the NetworkTracer automatic-stop request limit. */
  private setNetworkAutoStopAfterRequests(value: number | undefined): void {
    globalThis.autoTracer?.networkTracer?.setAutoStopAfterRequests?.(value);
  }

  /** Returns detached NetworkTracer redaction patterns. */
  private getNetworkRedactionPatterns(): readonly string[] {
    return globalThis.autoTracer?.networkTracer?.getRedactionPatterns?.() ?? [];
  }

  /** Persists NetworkTracer redaction patterns. */
  private setNetworkRedactionPatterns(value: readonly string[]): void {
    globalThis.autoTracer?.networkTracer?.setRedactionPatterns?.(value);
  }

  /** Returns detached NetworkTracer inclusion patterns. */
  private getNetworkIncludePatterns(): readonly string[] {
    return globalThis.autoTracer?.networkTracer?.getIncludePatterns?.() ?? [];
  }

  /** Persists NetworkTracer inclusion patterns. */
  private setNetworkIncludePatterns(value: readonly string[]): void {
    globalThis.autoTracer?.networkTracer?.setIncludePatterns?.(value);
  }

  /** Returns detached NetworkTracer exclusion patterns. */
  private getNetworkExcludePatterns(): readonly string[] {
    return globalThis.autoTracer?.networkTracer?.getExcludePatterns?.() ?? [];
  }

  /** Persists NetworkTracer exclusion patterns. */
  private setNetworkExcludePatterns(value: readonly string[]): void {
    globalThis.autoTracer?.networkTracer?.setExcludePatterns?.(value);
  }

  /** Restores NetworkTracer configuration defaults. */
  private resetNetworkConfig(): void {
    globalThis.autoTracer?.networkTracer?.resetConfig?.();
    this.render();
  }

  /**
   * Mark widget as shown and ensure it's visible.
   */
  private markAsShownAndShow(): void {
    markAsShown();
    if (!this.isVisible) {
      this.show();
    }
  }

  /**
   * Expand widget to show controls.
   */
  private expand(): void {
    this.isExpanded = true;
    this.render();

    // Add clickaway listener to collapse when clicking outside
    this.clickAwayListener = (event: MouseEvent) => {
      if (!this.container.contains(event.target as Node)) {
        this.collapse();
      }
    };

    // Use setTimeout to avoid immediately closing from the same click that opened it
    setTimeout(() => {
      document.addEventListener("click", this.clickAwayListener!, true);
    }, 0);
  }

  /**
   * Collapse widget to pill state.
   */
  private collapse(): void {
    this.isExpanded = false;
    this.render();

    // Remove clickaway listener
    if (this.clickAwayListener) {
      document.removeEventListener("click", this.clickAwayListener, true);
      this.clickAwayListener = null;
    }
  }

  /**
   * Show the widget.
   */
  public show(): void {
    this.isVisible = true;
    this.container.classList.remove("dashboard-hidden");
  }

  /**
   * Hide the widget.
   */
  public hide(): void {
    this.isVisible = false;
    this.container.classList.add("dashboard-hidden");
  }

  /**
   * Toggle widget visibility.
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if widget is visible.
   */
  public isWidgetVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Mount widget to DOM.
   *
   * @param rootElement - Container element to mount into.
   */
  public mount(rootElement: HTMLElement): void {
    rootElement.appendChild(this.container);
  }

  /**
   * Unmount widget from DOM.
   */
  public unmount(): void {
    // Clean up clickaway listener
    if (this.clickAwayListener) {
      document.removeEventListener("click", this.clickAwayListener, true);
      this.clickAwayListener = null;
    }

    // Stop state polling
    this.stopStatePolling();

    this.container.remove();
  }

  /**
   * Get React tracer enabledOnLoad state.
   * Falls back to direct localStorage read if tracer not initialized yet.
   */
  private getReactEnabledOnLoad(): boolean {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (reactTracer?.getEnabledOnLoad) {
      return reactTracer.getEnabledOnLoad();
    }

    // Fallback: read directly from localStorage if tracer not initialized
    try {
      const value = localStorage.getItem("autotracer-react-enabled-on-load");
      return value === "true";
    } catch {
      return false;
    }
  }

  /**
   * Set React tracer enabledOnLoad state.
   */
  private setReactEnabledOnLoad(enabled: boolean): void {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (!reactTracer) {
      return;
    }
    reactTracer.setEnabledOnLoad?.(enabled);
  }

  /**
   * Get Flow tracer enabledOnLoad state.
   * Falls back to direct localStorage read if tracer not initialized yet.
   */
  private getFlowEnabledOnLoad(): boolean {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (flowTracer?.getEnabledOnLoad) {
      return flowTracer.getEnabledOnLoad();
    }

    // Fallback: read directly from localStorage if tracer not initialized
    try {
      const value = localStorage.getItem("autotracer-flow-enabled-on-load");
      return value === "true";
    } catch {
      return false;
    }
  }

  /**
   * Set Flow tracer enabledOnLoad state.
   */
  private setFlowEnabledOnLoad(enabled: boolean): void {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (!flowTracer) {
      return;
    }
    flowTracer.setEnabledOnLoad?.(enabled);
  }

  /**
   * Get React tracer auto-stop limit.
   */
  private getReactAutoStopRenders(): number | null {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (reactTracer?.getAutoStopAfterRenders) {
      return reactTracer.getAutoStopAfterRenders();
    }

    // Fallback: read directly from localStorage
    try {
      const value = localStorage.getItem("autotracer-react-autostop-renders");
      if (value === null) return null;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) || parsed <= 0 ? null : parsed;
    } catch {
      return null;
    }
  }

  /**
   * Set React tracer auto-stop limit.
   */
  private setReactAutoStopRenders(limit: number | null): void {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (!reactTracer) {
      return;
    }
    reactTracer.setAutoStopAfterRenders?.(limit);
  }

  /**
   * Get Flow tracer auto-stop top-level limit.
   */
  private getFlowAutoStopTopLevel(): number | null {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (flowTracer?.getAutoStopTopLevel) {
      return flowTracer.getAutoStopTopLevel();
    }

    // Fallback: read directly from localStorage
    try {
      const value = localStorage.getItem("autotracer-flow-autostop-toplevel");
      if (value === null) return null;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) || parsed <= 0 ? null : parsed;
    } catch {
      return null;
    }
  }

  /**
   * Set Flow tracer auto-stop top-level limit.
   */
  private setFlowAutoStopTopLevel(limit: number | null): void {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (!flowTracer) {
      return;
    }
    flowTracer.setAutoStopTopLevel?.(limit);
  }

  /**
   * Get Flow tracer auto-stop all functions limit.
   */
  private getFlowAutoStopAll(): number | null {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (flowTracer?.getAutoStopAll) {
      return flowTracer.getAutoStopAll();
    }

    // Fallback: read directly from localStorage
    try {
      const value = localStorage.getItem("autotracer-flow-autostop-all");
      if (value === null) return null;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) || parsed <= 0 ? null : parsed;
    } catch {
      return null;
    }
  }

  /**
   * Set Flow tracer auto-stop all functions limit.
   */
  private setFlowAutoStopAll(limit: number | null): void {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (!flowTracer) {
      return;
    }
    flowTracer.setAutoStopAll?.(limit);
  }

  // React Tracer Trigger Methods

  /**
   * Get React tracer start trigger pattern.
   */
  private getReactStartTrigger(): string | null {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (reactTracer?.getStartTrigger) {
      return reactTracer.getStartTrigger();
    }
    return null;
  }

  /**
   * Set React tracer start trigger pattern.
   */
  private setReactStartTrigger(pattern: string | null): void {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (!reactTracer) {
      return;
    }
    reactTracer.setStartTrigger?.(pattern);
  }

  /**
   * Get React tracer end trigger pattern.
   */
  private getReactEndTrigger(): string | null {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (reactTracer?.getEndTrigger) {
      return reactTracer.getEndTrigger();
    }
    return null;
  }

  /**
   * Set React tracer end trigger pattern.
   */
  private setReactEndTrigger(pattern: string | null): void {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (!reactTracer) {
      return;
    }
    reactTracer.setEndTrigger?.(pattern);
  }

  /**
   * Get React tracer end trigger mode.
   */
  private getReactEndTriggerMode(): "on-entry" | "on-exit" {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (reactTracer?.getEndTriggerMode) {
      return reactTracer.getEndTriggerMode();
    }
    return "on-exit";
  }

  /**
   * Set React tracer end trigger mode.
   */
  private setReactEndTriggerMode(mode: "on-entry" | "on-exit"): void {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (!reactTracer) {
      return;
    }
    reactTracer.setEndTriggerMode?.(mode);
  }

  /**
   * Get React tracer trigger rearm mode.
   */
  private getReactTriggerRearmMode(): "always" | "once" {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (reactTracer?.getTriggerRearmMode) {
      return reactTracer.getTriggerRearmMode();
    }
    return "once";
  }

  /**
   * Set React tracer trigger rearm mode.
   */
  private setReactTriggerRearmMode(mode: "always" | "once"): void {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (!reactTracer) {
      return;
    }
    reactTracer.setTriggerRearmMode?.(mode);
  }

  /**
   * Clear all React tracer triggers.
   */
  private clearReactTriggers(): void {
    const reactTracer = globalThis.autoTracer?.reactTracer;
    if (!reactTracer) {
      return;
    }
    reactTracer.clearAllTriggers?.();
  }

  // Flow Tracer Trigger Methods

  /**
   * Get Flow tracer start trigger pattern.
   */
  private getFlowStartTrigger(): string | null {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (flowTracer?.getStartTrigger) {
      return flowTracer.getStartTrigger();
    }
    return null;
  }

  /**
   * Set Flow tracer start trigger pattern.
   */
  private setFlowStartTrigger(pattern: string | null): void {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (!flowTracer) {
      return;
    }
    flowTracer.setStartTrigger?.(pattern);
  }

  /**
   * Get Flow tracer end trigger pattern.
   */
  private getFlowEndTrigger(): string | null {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (flowTracer?.getEndTrigger) {
      return flowTracer.getEndTrigger();
    }
    return null;
  }

  /**
   * Set Flow tracer end trigger pattern.
   */
  private setFlowEndTrigger(pattern: string | null): void {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (!flowTracer) {
      return;
    }
    flowTracer.setEndTrigger?.(pattern);
  }

  /**
   * Get Flow tracer end trigger mode.
   */
  private getFlowEndTriggerMode(): "on-entry" | "on-exit" {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (flowTracer?.getEndTriggerMode) {
      return flowTracer.getEndTriggerMode();
    }
    return "on-exit";
  }

  /**
   * Set Flow tracer end trigger mode.
   */
  private setFlowEndTriggerMode(mode: "on-entry" | "on-exit"): void {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (!flowTracer) {
      return;
    }
    flowTracer.setEndTriggerMode?.(mode);
  }

  /**
   * Get Flow tracer trigger rearm mode.
   */
  private getFlowTriggerRearmMode(): "always" | "once" {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (flowTracer?.getTriggerRearmMode) {
      return flowTracer.getTriggerRearmMode();
    }
    return "once";
  }

  /**
   * Set Flow tracer trigger rearm mode.
   */
  private setFlowTriggerRearmMode(mode: "always" | "once"): void {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (!flowTracer) {
      return;
    }
    flowTracer.setTriggerRearmMode?.(mode);
  }

  /**
   * Clear all Flow tracer triggers.
   */
  private clearFlowTriggers(): void {
    const flowTracer = globalThis.autoTracer?.flowTracer;
    if (!flowTracer) {
      return;
    }
    flowTracer.clearAllTriggers?.();
  }
}
