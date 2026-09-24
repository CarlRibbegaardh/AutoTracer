import { mountDashboard } from "./mountDashboard.js";

/**
 * Restore dashboard controls when necessary and toggle widget visibility.
 *
 * Side effects: may mount the dashboard and changes its visibility.
 */
export const toggleDashboard = (): void => {
  mountDashboard();
  globalThis.autoTracer?.widget?.toggle();
};
