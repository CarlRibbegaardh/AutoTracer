/**
 * Storage key for widget visibility persistence.
 */
const STORAGE_KEY = "autotracer-widget-shown" as const;

/**
 * Check if widget has been shown before (localStorage persistence).
 *
 * @returns True if widget was shown in a previous session.
 */
export const hasBeenShown = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

/**
 * Mark widget as shown (persist to localStorage).
 */
export const markAsShown = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Ignore localStorage errors (e.g., incognito mode)
  }
};
