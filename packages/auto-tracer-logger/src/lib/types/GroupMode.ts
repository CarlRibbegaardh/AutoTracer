/**
 * Logger grouping mode.
 *
 * - `default`: uses `console.group()` / `console.groupEnd()`.
 * - `text`: emits UTF-8 box-drawing prefixes and manages indentation in text.
 */
export type GroupMode = "default" | "text";
