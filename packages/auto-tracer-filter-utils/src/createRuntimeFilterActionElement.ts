import type { CreateRuntimeFilterActionElementParams } from "./CreateRuntimeFilterActionElementParams.js";

/**
 * Creates a clickable UI element intended to be logged to the DevTools console.
 *
 * Important:
 * - This is a best-effort interaction pattern; click handling depends on the
 *   browser DevTools implementation.
 *
 * Side effects:
 * - Allocates a DOM element and attaches an event listener when `document` exists.
 *
 * @param params - Element configuration
 * @returns A DOM element when available; otherwise undefined
 */
export function createRuntimeFilterActionElement(
  params: CreateRuntimeFilterActionElementParams
): unknown {
  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  function getDocumentOrUndefined(): unknown {
    try {
      return Reflect.get(globalThis, "document");
    } catch (_error) {
      return undefined;
    }
  }

  function invokePreventDefault(event: unknown): void {
    if (!isRecord(event)) return;
    const preventDefault = Reflect.get(event, "preventDefault");
    if (typeof preventDefault !== "function") return;
    Reflect.apply(preventDefault, event, []);
  }

  function invokeStopPropagation(event: unknown): void {
    if (!isRecord(event)) return;
    const stopPropagation = Reflect.get(event, "stopPropagation");
    if (typeof stopPropagation !== "function") return;
    Reflect.apply(stopPropagation, event, []);
  }

  const doc = getDocumentOrUndefined();
  if (!isRecord(doc)) return undefined;

  const createElement = Reflect.get(doc, "createElement");
  if (typeof createElement !== "function") return undefined;

  const el: unknown = Reflect.apply(createElement, doc, ["a"]);
  if (!isRecord(el)) return undefined;

  Reflect.set(el, "textContent", params.iconText);
  Reflect.set(el, "href", "#");
  Reflect.set(el, "title", params.title);

  const style = Reflect.get(el, "style");
  if (isRecord(style)) {
    Reflect.set(style, "cursor", "pointer");
    Reflect.set(style, "userSelect", "none");
    Reflect.set(style, "marginLeft", "0.5em");
  }

  const addEventListener = Reflect.get(el, "addEventListener");
  if (typeof addEventListener === "function") {
    Reflect.apply(addEventListener, el, [
      "click",
      (event: unknown) => {
        invokePreventDefault(event);
        invokeStopPropagation(event);
        params.onClick();
      },
    ]);
  }

  return el;
}
