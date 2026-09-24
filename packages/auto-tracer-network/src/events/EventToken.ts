/**
 * One renderer-neutral fragment of a NetworkTracer event line.
 */
export type EventToken = Readonly<{
  role:
    | "identity"
    | "direction"
    | "method"
    | "url"
    | "status"
    | "outcome"
    | "redirect"
    | "duration"
    | "label"
    | "unavailable"
    | "runtime-control"
    | "plain";
  text: string;
}>;
