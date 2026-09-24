/**
 * Minimal representation of a comment node that pragma detection requires.
 *
 * @remarks
 * This interface intentionally omits position and source information to remain
 * compatible with both Babel AST nodes and any other AST that attaches leading
 * comments.  Consumers should map their concrete comment node type to this shape
 * before calling {@link getFunctionPragmas}.
 */
export interface PragmaCommentHost {
  /** The leading comment nodes attached to this AST node, if any. */
  readonly leadingComments?: ReadonlyArray<{
    /** Raw comment text without the line-comment prefix or block-comment delimiters. */
    readonly value: string;
    /** AST comment kind: only `"CommentLine"` nodes are examined for pragmas. */
    readonly type: string;
  }> | null;
}
