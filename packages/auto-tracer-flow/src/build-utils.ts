// Build-time utilities for use in Babel/Vite plugins
// These functions use Node.js APIs (fs) and should NOT be imported in browser/client code

export { loadThemeFiles } from "./lib/functions/theme/loadThemeFiles.js";
export { validateTheme } from "./lib/functions/theme/validateTheme.js";
