import { describe, expect, it, vi } from "vitest";
import { installXhrWrappers } from "../../../src/transport/installXhrWrappers";

describe("installXhrWrappers", () => {
  it("[NET-INSTALL-008,010][NET-NATIVE-002] captures XHR methods and forwards receiver and arguments", () => {
    const nativeOpen = vi.fn();
    const nativeSend = vi.fn();
    const nativeSetRequestHeader = vi.fn();
    const prototype = {
      open: nativeOpen,
      send: nativeSend,
      setRequestHeader: nativeSetRequestHeader,
    };
    const invokeOpen = vi.fn();
    const invokeSend = vi.fn();
    const invokeSetRequestHeader = vi.fn();

    expect(
      installXhrWrappers(
        { prototype },
        { invokeOpen, invokeSend, invokeSetRequestHeader },
      ),
    ).toBe(true);

    const xhr = Object.create(prototype);
  const url = new URL("https://example.test/items");
  prototype.open.call(xhr, "POST", url, false, "user", "password");
    const body = new FormData();
    prototype.send.call(xhr, body);
    prototype.setRequestHeader.call(xhr, "X-Test", "one");

    expect(invokeOpen).toHaveBeenCalledExactlyOnceWith(
      nativeOpen,
      xhr,
      ["POST", url, false, "user", "password"],
    );
    expect(invokeSend).toHaveBeenCalledExactlyOnceWith(nativeSend, xhr, [body]);
    expect(invokeSetRequestHeader).toHaveBeenCalledExactlyOnceWith(
      nativeSetRequestHeader,
      xhr,
      ["X-Test", "one"],
    );
  });

  it("[NET-INSTALL-012] skips an unavailable XHR constructor", () => {
    const handlers = {
      invokeOpen: vi.fn(),
      invokeSend: vi.fn(),
      invokeSetRequestHeader: vi.fn(),
    };

    expect(installXhrWrappers(undefined, handlers)).toBe(false);
    expect(handlers.invokeOpen).not.toHaveBeenCalled();
    expect(handlers.invokeSend).not.toHaveBeenCalled();
    expect(handlers.invokeSetRequestHeader).not.toHaveBeenCalled();
  });
});
