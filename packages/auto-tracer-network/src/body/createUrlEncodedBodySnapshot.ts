import { truncateTextBodyAtLimit } from "./truncateTextBodyAtLimit.js";

/**
 * Serializes URL-encoded data and captures it within an inclusive UTF-8 limit.
 *
 * @param parameters - URL-encoded values to serialize.
 * @param limitBytes - Maximum serialized byte count to capture.
 * @returns The captured serialized text and its UTF-8 size metadata.
 */
export function createUrlEncodedBodySnapshot(
  parameters: URLSearchParams,
  limitBytes: number,
): {
  readonly status: "captured";
  readonly text: string;
  readonly originalByteSize: number;
  readonly capturedByteSize: number;
  readonly truncated: boolean;
} {
  return truncateTextBodyAtLimit(parameters.toString(), limitBytes);
}
