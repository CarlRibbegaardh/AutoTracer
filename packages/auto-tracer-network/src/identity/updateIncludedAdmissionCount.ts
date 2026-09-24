/**
 * Updates the automatic-stop admission count for one request.
 *
 * @param admissionCount - Current included-request admission count.
 * @param included - Whether the request passed filtering.
 * @returns The updated admission count.
 */
export function updateIncludedAdmissionCount(
  admissionCount: number,
  included: boolean,
): number {
  return included ? admissionCount + 1 : admissionCount;
}
