# Contributor Setup

Use Node.js 24 for repository builds, tests, and development. The repository uses pnpm workspaces and pins pnpm through the root `packageManager` field.

## Prerequisites

- Node.js 24
- Corepack
- pnpm 10.18.3

Confirm the active tool versions from the repository root:

```bash
node --version
pnpm --version
```

The Node.js version must report `v24.x`, and the pnpm version must report `10.18.3`.

## Install Dependencies

Enable the package manager version declared by the repository, then install dependencies:

```bash
corepack enable
corepack install
pnpm install
```

## Verify the Workspace

Run the complete verification suite before starting implementation work and again before considering a change complete:

```bash
pnpm verify
```

This command builds, lints, and tests the workspace, including its end-to-end suites.
