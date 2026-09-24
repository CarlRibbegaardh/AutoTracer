/**
 * Default field-name patterns used to redact common credential values.
 */
export const defaultRedactionPatterns: readonly string[] = [
  "authorization",
  "cookie",
  "*token*",
  "*secret*",
  "*password*",
  "*signature*",
  "*x-api-key*",
] as const;
