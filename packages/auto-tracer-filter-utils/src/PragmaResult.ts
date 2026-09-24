/**
 * The result of scanning the leading comments of an AST node for pragma tokens.
 */
export interface PragmaResult {
  /** `true` when a valid `// @trace` pragma is present in a `CommentLine` node. */
  readonly hasTrace: boolean;
  /** `true` when a valid `// @trace-disable` pragma is present in a `CommentLine` node. */
  readonly hasDisable: boolean;
}
