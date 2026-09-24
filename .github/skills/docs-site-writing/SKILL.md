---
name: docs-site-writing
description: 'Audit, rewrite, or review public docs in packages/auto-tracer-docs and package README.md files. Use for docs cleanup, docs tone fixes, source-backed rewrites, or public docs reviews. Follow .github/instructions/docs-site.instructions.md as the canonical rules.'
argument-hint: 'Path and goal, e.g. rewrite packages/auto-tracer-docs/best-practices/security.md or packages/auto-tracer-react18/README.md'
---

# Public Docs Workflow

Use this skill for public documentation work in `packages/auto-tracer-docs` and `packages/*/README.md`.

Treat `.github/instructions/docs-site.instructions.md` as the canonical rule set.

Do not use this skill for `docs/`, `docs/dev`, or `docs/work` unless the user explicitly asks for that scope.

## When to Use

- Rewrite a public docs page or package README.
- Audit a public docs page or package README.
- Review public docs for factual drift, meta language, or scope problems.

## Procedure

1. Identify whether the target is public docs content or internal material.
2. If the file is outside `packages/auto-tracer-docs` and `packages/*/README.md`, stop unless the user explicitly asked for that broader scope.
3. Read the local source of truth before rewriting: implementation, TSDoc, and the nearest canonical docs page for the same feature.
4. Apply `.github/instructions/docs-site.instructions.md` while rewriting or reviewing.
5. Check adjacent public docs or READMEs when the change would otherwise leave conflicting guidance.
6. If asked for a review instead of a rewrite, report findings first and focus on factual bugs, misleading wording, behavioral regressions, and missing examples.
