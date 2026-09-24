import { invokeTracedXhrSend } from "./invokeTracedXhrSend.js";

/**
 * Routes an XHR send according to its trace admission decision.
 *
 * @param nativeSend - Bound native XHR send implementation.
 * @param request - XHR instance and original send arguments.
 * @param trace - Admission decision and traced-request context.
 */
export function invokeXhrSendByAdmission(
  nativeSend: Parameters<typeof invokeTracedXhrSend>[0],
  request: Parameters<typeof invokeTracedXhrSend>[1],
  trace:
    | Readonly<{ admitted: false }>
    | (Parameters<typeof invokeTracedXhrSend>[2] &
        Readonly<{ admitted: true }>),
): void {
  if (!trace.admitted) {
    nativeSend(...request.args);
    return;
  }

  invokeTracedXhrSend(nativeSend, request, trace);
}
