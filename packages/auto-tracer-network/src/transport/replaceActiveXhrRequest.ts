import { finalizeReplacedXhrRequest } from "./finalizeReplacedXhrRequest.js";
import type { startTracedXhrRequest } from "./startTracedXhrRequest.js";

/**
 * Removes native listeners and finalizes one replaced XHR request.
 *
 * @param request - Active traced XHR request being replaced.
 * @param completionMarker - Monotonic marker captured at replacement.
 * @param emit - Emits the replacement abort event.
 */
export function replaceActiveXhrRequest(
  request: ReturnType<typeof startTracedXhrRequest>,
  completionMarker: number,
  emit: Parameters<typeof finalizeReplacedXhrRequest>[2],
): void {
  request.removeTerminalListeners();
  finalizeReplacedXhrRequest(request, completionMarker, emit);
}
