import { HotkeyManager } from "./hotkeys/HotkeyManager.js";
import type {
  DashboardConfig,
  NormalizedDashboardConfig,
  WidgetControls,
} from "./types/DashboardConfig.js";
import { DashboardWidget } from "./widget/DashboardWidget.js";
import { markAsShown } from "./widget/storage.js";

/**
 * Normalize dashboard configuration by applying defaults.
 *
 * @param config - Partial dashboard configuration.
 * @returns Normalized configuration with all defaults applied.
 */
const normalizeConfig = (
  config: Partial<DashboardConfig>,
): NormalizedDashboardConfig => {
  return {
    enabled: true,
    hideByDefault: config.hideByDefault ?? true,
    position: config.position ?? "bottom-right",
    hotkeys: {
      toggleTracing: config.hotkeys?.toggleTracing ?? "Alt+Shift+T",
      toggleDashboard: config.hotkeys?.toggleDashboard ?? "Alt+Shift+D",
    },
  };
};

/**
 * Toggle all available tracers (React and/or Flow).
 */
const toggleAllTracers = (): void => {
  let anyStarted = false;

  if (globalThis.autoTracer?.reactTracer) {
    if (globalThis.autoTracer.reactTracer.isEnabled()) {
      globalThis.autoTracer.reactTracer.stop();
    } else {
      globalThis.autoTracer.reactTracer.start();
      anyStarted = true;
    }
  }

  if (globalThis.autoTracer?.flowTracer) {
    if (globalThis.autoTracer.flowTracer.isEnabled()) {
      globalThis.autoTracer.flowTracer.stop();
    } else {
      globalThis.autoTracer.flowTracer.start();
      anyStarted = true;
    }
  }

  // If any tracer was started, mark widget as shown and ensure visibility
  if (anyStarted) {
    markAsShown();
    if (globalThis.autoTracer?.widget) {
      globalThis.autoTracer.widget.show();
    }
  }
};

/**
 * Mount the dashboard widget to the DOM and register hotkeys.
 *
 * Configuration is merged from three sources (in priority order):
 * 1. Runtime config parameter (highest priority)
 * 2. Vite plugin-injected config (globalThis.__autoTracerDashboardConfig)
 * 3. Built-in defaults (lowest priority)
 *
 * @param config - Dashboard configuration (partial, defaults will be applied).
 */
export const mountDashboard = (config: Partial<DashboardConfig> = {}): void => {
  const rootId = "autotracer-dashboard-root";
  const existingRoot = document.getElementById(rootId);
  const hasMountedDashboard =
    existingRoot !== null &&
    existingRoot.querySelector(".autotracer-dashboard") !== null;

  // Guard: Prevent duplicate mounting (important for islands architecture)
  if (globalThis.autoTracer?.widget) {
    return;
  }

  if (hasMountedDashboard && globalThis.__autoTracerDashboardControls) {
    globalThis.autoTracer = globalThis.autoTracer ?? {};
    globalThis.autoTracer.widget = globalThis.__autoTracerDashboardControls;
    return;
  }

  if (hasMountedDashboard) {
    return;
  }

  // Merge config from plugin injection and runtime parameter
  const injectedConfig = globalThis.__autoTracerDashboardConfig ?? {};
  const mergedConfig = { ...injectedConfig, ...config };

  // Guard: check disabled state on the raw merged config before normalization.
  // normalizeConfig always produces enabled: true, so the check must happen here.
  if (mergedConfig.enabled === false) {
    return;
  }

  const normalized = normalizeConfig(mergedConfig);

  // Find or create root element
  let root = existingRoot;

  if (!root) {
    root = document.createElement("div");
    root.id = rootId;
    document.body.appendChild(root);
  }

  // Create widget
  const widget = new DashboardWidget(normalized);
  widget.mount(root);

  // Create hotkey manager
  const hotkeyManager = new HotkeyManager(
    normalized.hotkeys,
    toggleAllTracers,
    () => widget.toggle(),
  );
  hotkeyManager.register();

  // Expose widget controls via globalThis
  if (!globalThis.autoTracer) {
    globalThis.autoTracer = {};
  }

  const controls: WidgetControls = {
    show: () => widget.show(),
    hide: () => widget.hide(),
    toggle: () => widget.toggle(),
    isVisible: () => widget.isWidgetVisible(),
    unregisterHotkeys: () => hotkeyManager.unregister(),
  };

  globalThis.__autoTracerDashboardControls = controls;
  globalThis.autoTracer.widget = controls;
};
