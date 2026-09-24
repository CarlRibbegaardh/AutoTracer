/**
 * Emits asynchronous detail values in their settlement order.
 *
 * @param details - Concurrent detail capture operations.
 * @param emit - Emits one settled detail value.
 * @returns A promise that resolves after every detail has emitted.
 */
export function emitDetailsAsSettled<Value>(
  details: readonly Promise<Value>[],
  emit: (detail: Value) => void,
): Promise<void[]> {
  return Promise.all(details.map(async (detail) => {return emit(await detail)}));
}
