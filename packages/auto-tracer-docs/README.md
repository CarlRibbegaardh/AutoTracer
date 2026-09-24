# @autotracer/docs

VitePress documentation site for the AutoTracer ecosystem.

## Overview

Static documentation site for FlowTracer and ReactTracer, providing installation guides, API references, examples, and best practices for automated tracing in JavaScript and React applications.

## Why Use It

Single documentation hub for the AutoTracer ecosystem, with framework-specific guides and runnable examples.

## Development

### Local Development

```bash
# From repository root
pnpm --filter @autotracer/docs dev
```

The site will be available at `http://localhost:5173` by default.

### Building

```bash
# From repository root
pnpm --filter @autotracer/docs build
```

Build output will be in `.vitepress/dist/`.

### Preview Build

```bash
# From repository root
pnpm --filter @autotracer/docs preview
```

### Cleaning

```bash
# From repository root
pnpm --filter @autotracer/docs clean
```

## Structure

```
packages/auto-tracer-docs/
├─ .vitepress/         # VitePress configuration and theme
├─ public/             # Static assets served as-is
│  └─ screenshots/     # Screenshot assets grouped by doc area
├─ guide/              # Getting started, installation, configuration
├─ api/                # API reference for all packages
├─ examples/           # Usage examples and patterns
├─ best-practices/     # Security, performance, deployment
└─ index.md            # Home page
```

## Screenshot Assets

Store screenshots in `packages/auto-tracer-docs/public/screenshots/<area>/`.

Use these area folders:

- `api/`
- `best-practices/`
- `dashboard/`
- `examples/`
- `guide/`
- `reference/`
- `shared/` for reused screenshots or homepage assets
- `themes/`

Use lowercase kebab-case file names with a stable descriptive pattern:

- `<area>-<page>-<subject>-<state>[-<viewport>]-<theme>.<ext>`

Example:

- `dashboard-overview-panel-idle-light.png`

Prefer `.png` for UI-heavy documentation screenshots. Use `.webp` only when file size matters and text remains clearly readable.

Once a screenshot is referenced from a page, keep the file name stable and replace the file in place instead of renaming it.

## Deployment

The site is deployed to `docs.autotracer.dev` via GitHub Actions on every push to `main`.

## Audience

- Developer currently integrating
- Person seeing if the library suits them
- AI agent searching for information

## Documentation Workflow

Work one library at a time, in this order:

1. `@autotracer/react18`
2. `@autotracer/plugin-vite-react18`
3. `@autotracer/plugin-babel-react18`
4. `@autotracer/inject-react18`
5. `@autotracer/flow`
6. `@autotracer/plugin-vite-flow`
7. `@autotracer/plugin-babel-flow`
8. `@autotracer/dashboard`
9. `@autotracer/logger`

Apply these working rules throughout the pass:

- Keep the canonical settings and runtime pages as the primary source of truth.
- Keep examples minimal.
- Do not pass default parameters unless the example specifically needs to show that default behavior.
- If a default value is shown, explain why it matters in that example.
- Link settings to each other only when their behavior overlaps or one setting changes how another setting behaves.
- Add links to runtime API pages only when readers need both pages to understand the feature.
- When a step exposes a docs problem, correct it in that same step before moving on.
- Do not treat audit steps as read-only thinking time. Each step must end with either a concrete edit or a concrete written output that names the exact surface that was checked.
- Do not mark a step done while a known issue from that step is still unfixed in the affected public docs.

For each library, follow this library pass:

1. Inventory the full public surface: build-time settings, runtime initializer settings, `globalThis.autoTracer` APIs, and any theme or adjacent configuration surfaces. Write the inventory down as an explicit surface list. If the inventory exposes a missing or misleading primary surface, fix that surface before moving on.
2. State the recommended configuration path up front if the library supports multiple ways to set the same behavior. Put that recommendation on the library's main public entry page immediately if it is missing or unclear.
3. Run the per-setting pass for each documented setting. Complete settings one at a time, and correct each setting page as soon as you confirm a gap.
4. After the settings pass, document or rewrite the runtime API pages for that library in the same source-driven, concise, behaviorally exact style.
5. Update installation pages, quickstarts, and other entry points so they point to the canonical settings pages, runtime API pages, and theme docs where that helps the reader continue. Apply those updates in this same library pass, not later.
6. If the library has themes or another adjacent configuration surface, document it in the same library pass instead of leaving it behind.
7. Remove or rewrite stale second sources of truth so the canonical settings and runtime pages define the wording. Do this as soon as the canonical wording exists.
8. Align older public docs and package READMEs with the canonical wording when the library pass changes terminology or guidance.

For each setting in that library, run this setting pass:

1. Verify the exact behavior in source before writing or rewriting the page.
2. Create or complete the canonical page for that setting immediately after verification. Keep it source-driven, concise, and behaviorally exact.
3. If the step exposed misleading wording in an adjacent public page, trim or correct that wording before moving to the next setting.
4. Add or refine the example only if the setting needs one.
5. Add links to overlapping settings only when they help explain real behavior.
6. Add a runtime API hint only when readers need that adjacent page to understand or use the setting.

## Settings Page Style

There are two valid settings-page substyles in this docs set. Both are acceptable when chosen deliberately.

### 1. Single-Setting Reference

Use this when the setting is mostly a direct knob: boolean, enum, string, number, or another option whose meaning is easy to explain without introducing a larger concept.

Target shape:

1. Opening sentence that identifies the layer, package, initializer, and exact purpose in plain language.
2. One short behavior paragraph that explains what changes when the setting is used.
3. Default behavior made explicit, either in the metadata line or the opening explanation.
4. `Values` only when the user must choose among discrete options.
5. `Usage` with one minimal example.
6. Links only to settings or runtime APIs that materially affect the meaning of the page.

### 2. Concept-Plus-Setting Reference

Use this when the setting carries a small model with it: merge behavior, precedence, eligibility rules, field structure, triggers, wrapper usage, or another concept that a new reader will not grasp from a single paragraph.

Target shape:

1. The same clear opening as the single-setting reference page.
2. One short behavior paragraph in user-facing language.
3. One or more custom sections that teach only the minimum extra concept the reader needs, such as `Default`, `Fields`, `Shape`, `What Counts As Empty`, or `When To Use It`.
4. `Usage` with one minimal example, plus one additional example only if the concept genuinely needs it.
5. Links only to the settings, runtime APIs, or adjacent docs that change how the setting should be understood.

### Writing Standard

Aim for the older reference-manual style: immediately legible, specific, and calm. The page should feel easy to enter for a new reader without becoming chatty.

Within the first screenful, a new reader should be able to answer:

1. What is this setting for?
2. What happens by default?
3. What changes if I set it?
4. What values or shape are valid?
5. When should I reach for it?
6. What nearby setting or runtime API changes its meaning?

If a page is technically correct but still feels dense or acquired, keep the precision and add just enough explanatory structure for a first-time reader to orient themselves.

## License

MIT © Carl Ribbegårdh
