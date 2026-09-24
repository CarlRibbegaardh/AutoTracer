import type { createXhrInstanceStoreRegistry } from "./createXhrInstanceStoreRegistry.js";
import { invokeXhrOpenRequest } from "./invokeXhrOpenRequest.js";
import { invokeXhrSendRequest } from "./invokeXhrSendRequest.js";
import { invokeXhrSetRequestHeaderRequest } from "./invokeXhrSetRequestHeaderRequest.js";
import type { installXhrWrappers } from "./installXhrWrappers.js";

/**
 * Creates adapters between installed XHR wrappers and request tracing.
 *
 * @param registry - Stable tracing storage for each XHR instance.
 * @param runtime - Live XHR tracing operations shared by all instances.
 * @returns Handlers compatible with the XHR wrapper installer.
 */
export function createXhrWrapperHandlers(
  registry: ReturnType<typeof createXhrInstanceStoreRegistry>,
  runtime: Omit<
    Parameters<typeof invokeXhrSendRequest>[2],
    "getOpenMetadata" | "getRequestHeaders" | "setActiveRequest"
  >,
): Parameters<typeof installXhrWrappers>[1] {
  /** Routes open through a receiver-bound native method and instance state. */
  function invokeOpen(
    nativeOpen: XMLHttpRequest["open"],
    xhr: XMLHttpRequest,
    args: Parameters<typeof invokeXhrOpenRequest>[1],
  ): void {
    const store = registry.getInstanceStore(xhr);
    const boundNativeOpen = nativeOpen.bind(xhr);

    /** Invokes the matching native open overload on the current XHR. */
    function invokeNativeOpen(
      ...nativeArgs: Parameters<typeof invokeXhrOpenRequest>[1]
    ): void {
      if (nativeArgs.length === 2) {
        boundNativeOpen(nativeArgs[0], nativeArgs[1]);
        return;
      }

      boundNativeOpen(
        nativeArgs[0],
        nativeArgs[1],
        nativeArgs[2],
        nativeArgs[3],
        nativeArgs[4],
      );
    }

    invokeXhrOpenRequest(invokeNativeOpen, args, {
      getActiveRequest: store.getActiveRequest,
      clearActiveRequest: store.clearActiveRequest,
      setOpenMetadata: store.setOpenMetadata,
      clearRequestHeaders: store.clearRequestHeaders,
      getCompletionMarker: runtime.getMonotonicMarker,
      emit: runtime.emit,
    });
  }

  /** Routes send through a receiver-bound native method and instance state. */
  function invokeSend(
    nativeSend: XMLHttpRequest["send"],
    xhr: XMLHttpRequest,
    args: Parameters<typeof invokeXhrSendRequest>[1]["args"],
  ): void {
    const store = registry.getInstanceStore(xhr);
    invokeXhrSendRequest(
      nativeSend.bind(xhr),
      { xhr, args },
      { ...runtime, ...store },
    );
  }

  /** Routes request headers through a receiver-bound native method and instance state. */
  function invokeSetRequestHeader(
    nativeSetRequestHeader: XMLHttpRequest["setRequestHeader"],
    xhr: XMLHttpRequest,
    args: Parameters<typeof invokeXhrSetRequestHeaderRequest>[1],
  ): void {
    const store = registry.getInstanceStore(xhr);
    invokeXhrSetRequestHeaderRequest(
      nativeSetRequestHeader.bind(xhr),
      args,
      store.appendRequestHeader,
    );
  }

  return { invokeOpen, invokeSend, invokeSetRequestHeader };
}
