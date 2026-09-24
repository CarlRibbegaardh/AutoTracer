/**
 * Creates a detached clone of a structured detail value.
 *
 * @param value - Structured value visible to NetworkTracer.
 * @returns A detached value preserving the original structure.
 */
export function cloneStructuredSnapshot<Value>(value: Value): Value {
  return structuredClone(value);
}
