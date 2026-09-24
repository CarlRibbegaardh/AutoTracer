# AutoTracer Themes

This directory contains pre-made theme files inspired by popular VS Code themes. All themes are MIT-licensed and safe to use.

## Available Themes

### One Dark Pro

- **Based on:** Atom's iconic One Dark theme
- **License:** MIT
- **Type:** Dark theme only
- **Files:**
  - `one-dark-pro-react-theme-dark.json` - React component tracing
  - `one-dark-pro-flow-theme-dark.json` - Flow function tracing

**Color Palette:**

- Blue (`#61afef`) - Function entries, definitive renders
- Green (`#98c379`) - Exits, completions, memo
- Purple (`#c678dd`) - Async, props, context
- Yellow (`#e5c07b`) - State changes
- Red (`#e06c75`) - Errors, unmount
- Cyan (`#56b6c2`) - Return values, suspense
- Orange (`#d19a66`) - Runtime control, forwardRef
- Gray (`#abb2bf`) - Parameters, devtools

## How to Use

### Option 1: Copy to Project Root

Copy the theme files you want to your project's root directory (next to `package.json`):

```bash
# For React tracing
cp themes/one-dark-pro-react-theme-dark.json ./react-theme-dark.json

# For Flow tracing
cp themes/one-dark-pro-flow-theme-dark.json ./flow-theme-dark.json
```

### Option 2: Symlink (Advanced)

Create symlinks from your project root to these theme files:

```bash
# Windows (PowerShell as Administrator)
cd your-project-root
New-Item -ItemType SymbolicLink -Path "react-theme-dark.json" -Target "..\..\themes\one-dark-pro-react-theme-dark.json"

# Unix/Mac
cd your-project-root
ln -s ../themes/one-dark-pro-react-theme-dark.json react-theme-dark.json
```

### Option 3: Gitignore Pattern

Add to your project's `.gitignore`:

```gitignore
# Personal AutoTracer themes
*react-theme.json
*react-theme-light.json
*react-theme-dark.json
*flow-theme.json
*flow-theme-light.json
*flow-theme-dark.json
```

Then copy any theme file and it won't be committed.

## Testing Themes

### React Tracing

```bash
# Copy theme to example app
cp themes/one-dark-pro-react-theme-dark.json apps/example-app2/react-theme-dark.json

# Start dev server
pnpm --filter example-app2 dev
```

### Flow Tracing

```bash
# Copy theme to flow example
cp themes/one-dark-pro-flow-theme-dark.json apps/example-flow-basic/flow-theme-dark.json

# Start dev server
pnpm --filter example-flow-basic dev
```

Open browser DevTools and interact with the app to see themed console output.

## Contributing Themes

Want to add more themes? Follow these guidelines:

1. **Use MIT-licensed themes only** (check theme's license on VS Code marketplace)
2. **Include both React and Flow versions** (if creating full theme set)
3. **Document color palette** in this README
4. **Test in browser DevTools** before submitting
5. **Use semantic color mapping** (e.g., errors = red, success = green)

### Theme File Naming Convention

```
{theme-name}-react-theme.json          # React: both modes
{theme-name}-react-theme-light.json    # React: light mode only
{theme-name}-react-theme-dark.json     # React: dark mode only
{theme-name}-flow-theme.json           # Flow: both modes
{theme-name}-flow-theme-light.json     # Flow: light mode only
{theme-name}-flow-theme-dark.json      # Flow: dark mode only
```

## License

All theme files in this directory are MIT-licensed and based on MIT-licensed VS Code themes.

MIT © Carl Ribbegårdh
