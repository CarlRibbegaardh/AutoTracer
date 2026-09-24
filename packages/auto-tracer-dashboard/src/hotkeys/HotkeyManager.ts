import type { HotkeyConfig } from "../types/DashboardConfig.js";

/**
 * Check if event target is an input element where hotkeys should be ignored.
 *
 * @param target - Event target.
 * @returns True if hotkeys should be ignored for this target.
 */
const shouldIgnoreEvent = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    target.contentEditable === "true"
  );
};

/**
 * Parse hotkey string into normalized format.
 *
 * @param hotkey - Hotkey string (e.g., "Ctrl+Shift+T").
 * @returns Normalized hotkey parts.
 */
const parseHotkey = (
  hotkey: string,
): {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
} => {
  const parts = hotkey.split("+").map((p) => p.trim());
  return {
    ctrl: parts.some((p) => p.toLowerCase() === "ctrl"),
    shift: parts.some((p) => p.toLowerCase() === "shift"),
    alt: parts.some((p) => p.toLowerCase() === "alt"),
    key: parts[parts.length - 1] ?? "",
  };
};

/**
 * Check if keyboard event matches parsed hotkey.
 *
 * @param event - Keyboard event.
 * @param parsed - Parsed hotkey parts.
 * @returns True if event matches hotkey.
 */
const matchesHotkey = (
  event: KeyboardEvent,
  parsed: { ctrl: boolean; shift: boolean; alt: boolean; key: string },
): boolean => {
  return (
    event.ctrlKey === parsed.ctrl &&
    event.shiftKey === parsed.shift &&
    event.altKey === parsed.alt &&
    event.key.toLowerCase() === parsed.key.toLowerCase()
  );
};

/**
 * Hotkey manager for dashboard controls.
 */
export class HotkeyManager {
  private readonly config: HotkeyConfig;
  private readonly onToggleTracing: () => void;
  private readonly onToggleDashboard: () => void;
  private handler: ((event: KeyboardEvent) => void) | null = null;

  /**
   * Create a new hotkey manager.
   *
   * @param config - Hotkey configuration.
   * @param onToggleTracing - Callback when toggle tracing hotkey is pressed.
   * @param onToggleDashboard - Callback when toggle dashboard hotkey is pressed.
   */
  constructor(
    config: HotkeyConfig,
    onToggleTracing: () => void,
    onToggleDashboard: () => void,
  ) {
    this.config = config;
    this.onToggleTracing = onToggleTracing;
    this.onToggleDashboard = onToggleDashboard;
  }

  /**
   * Register hotkeys.
   */
  public register(): void {
    if (this.handler) {
      return; // Already registered
    }

    const toggleTracingParsed = parseHotkey(this.config.toggleTracing);
    const toggleDashboardParsed = parseHotkey(this.config.toggleDashboard);

    this.handler = (event: KeyboardEvent): void => {
      if (shouldIgnoreEvent(event.target)) {
        return;
      }

      if (matchesHotkey(event, toggleTracingParsed)) {
        event.preventDefault();
        this.onToggleTracing();
      } else if (matchesHotkey(event, toggleDashboardParsed)) {
        event.preventDefault();
        this.onToggleDashboard();
      }
    };

    document.addEventListener("keydown", this.handler);
  }

  /**
   * Unregister hotkeys.
   */
  public unregister(): void {
    if (this.handler) {
      document.removeEventListener("keydown", this.handler);
      this.handler = null;
    }
  }
}
