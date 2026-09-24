import { setupWorker } from "msw/browser";
import { taskHandlers } from "./handlers";

/**
 * Setup MSW service worker for browser
 */
export const worker = setupWorker(...taskHandlers);

/**
 * Start MSW worker
 */
export const startMockServiceWorker = async (): Promise<void> => {
  if (import.meta.env.DEV) {
    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }
};
