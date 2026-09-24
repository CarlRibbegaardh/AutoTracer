import type { invokeXhrOpenRequest } from "./invokeXhrOpenRequest.js";
import type { invokeXhrSendRequest } from "./invokeXhrSendRequest.js";
import type { invokeXhrSetRequestHeaderRequest } from "./invokeXhrSetRequestHeaderRequest.js";

/**
 * Installs wrappers around the methods currently on an XHR prototype.
 *
 * @param target - XHR constructor whose prototype methods are captured and replaced.
 * @param handlers - Tracing entry points for each wrapped method.
 * @returns Whether an XHR constructor was available and wrapped.
 */
export function installXhrWrappers(
  target:
    | Readonly<{
        prototype: Pick<
          XMLHttpRequest,
          "open" | "send" | "setRequestHeader"
        >;
      }>
    | undefined,
  handlers: Readonly<{
    invokeOpen: (
      nativeOpen: XMLHttpRequest["open"],
      xhr: XMLHttpRequest,
      args: Parameters<typeof invokeXhrOpenRequest>[1],
    ) => void;
    invokeSend: (
      nativeSend: XMLHttpRequest["send"],
      xhr: XMLHttpRequest,
      args: Parameters<typeof invokeXhrSendRequest>[1]["args"],
    ) => void;
    invokeSetRequestHeader: (
      nativeSetRequestHeader: XMLHttpRequest["setRequestHeader"],
      xhr: XMLHttpRequest,
      args: Parameters<typeof invokeXhrSetRequestHeaderRequest>[1],
    ) => void;
  }>,
): boolean {
  if (target === undefined) return false;

  const nativeOpen = target.prototype.open;
  const nativeSend = target.prototype.send;
  const nativeSetRequestHeader = target.prototype.setRequestHeader;

  /** Routes one XHR open call through the tracing runtime. */
  function wrappedOpen(
    this: XMLHttpRequest,
    ...args:
      | [method: string, url: string | URL]
      | [
          method: string,
          url: string | URL,
          async: boolean,
          username?: string | null,
          password?: string | null,
        ]
  ): void {
    handlers.invokeOpen(nativeOpen, this, args);
  }

  /** Routes one XHR send call through the tracing runtime. */
  function wrappedSend(
    this: XMLHttpRequest,
    ...args: [] | [body: Document | XMLHttpRequestBodyInit | null]
  ): void {
    handlers.invokeSend(nativeSend, this, args);
  }

  /** Routes one XHR request-header call through the tracing runtime. */
  function wrappedSetRequestHeader(
    this: XMLHttpRequest,
    ...args: [name: string, value: string]
  ): void {
    handlers.invokeSetRequestHeader(nativeSetRequestHeader, this, args);
  }

  target.prototype.open = wrappedOpen;
  target.prototype.send = wrappedSend;
  target.prototype.setRequestHeader = wrappedSetRequestHeader;
  return true;
}
