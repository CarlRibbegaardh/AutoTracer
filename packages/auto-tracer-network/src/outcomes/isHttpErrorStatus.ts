/**
 * Determines whether an HTTP status belongs to the 4xx or 5xx range.
 *
 * @param status - HTTP response status.
 * @returns `true` for statuses from 400 through 599.
 */
export function isHttpErrorStatus(status: number): boolean {
  return status >= 400 && status <= 599;
}
