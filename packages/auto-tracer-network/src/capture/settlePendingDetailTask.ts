/**
 * Settles pending logging work after a detail operation resolves or rejects.
 *
 * @param detail - Asynchronous detail capture operation.
 * @param settle - Settles one pending logging-work item.
 * @returns The original detail promise with settlement attached.
 */
export function settlePendingDetailTask<Value>(
  detail: Promise<Value>,
  settle: () => void,
): Promise<Value> {
  return detail.finally(settle);
}
