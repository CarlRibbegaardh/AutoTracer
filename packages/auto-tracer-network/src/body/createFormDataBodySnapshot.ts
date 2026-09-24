/**
 * Creates an ordered metadata snapshot of script-visible FormData entries.
 *
 * @param formData - FormData to snapshot.
 * @returns Ordered text values and file metadata without file contents.
 */
export function createFormDataBodySnapshot(formData: FormData): readonly (
  | { readonly kind: "text"; readonly name: string; readonly value: string }
  | {
      readonly kind: "file";
      readonly name: string;
      readonly fileName: string;
      readonly contentType: string;
      readonly byteSize: number;
    }
)[] {
  const snapshot: (
    | { readonly kind: "text"; readonly name: string; readonly value: string }
    | {
        readonly kind: "file";
        readonly name: string;
        readonly fileName: string;
        readonly contentType: string;
        readonly byteSize: number;
      }
  )[] = [];

  for (const [name, value] of formData.entries()) {
    snapshot.push(
      typeof value === "string"
        ? { kind: "text", name, value }
        : {
            kind: "file",
            name,
            fileName: value.name,
            contentType: value.type,
            byteSize: value.size,
          },
    );
  }

  return snapshot;
}
