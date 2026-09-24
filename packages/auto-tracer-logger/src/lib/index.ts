// Named logger API (v2.0)
export { createLogger } from "./Logger.js";

export { debug } from "./functions/logging/debug.js";

// Performance tracking
export { enter } from "./functions/tracking/enter.js";

export { error } from "./functions/logging/error.js";

export { exit } from "./functions/tracking/exit.js";

// Types
export type { ExitHandle } from "./types/ExitHandle.js";
// Logging functions
export { fatal } from "./functions/logging/fatal.js";

export { getGroupMode } from "./functions/state/getGroupMode.js";

export { getLogger } from "./registry/index.js";

// State management
export { getLogLevel } from "./functions/state/getLogLevel.js";

export { getTheme } from "./functions/state/getTheme.js";

// Grouping
export { group } from "./functions/grouping/group.js";

export { groupEnd } from "./functions/grouping/groupEnd.js";

export type { GroupMode } from "./types/GroupMode.js";

export { info } from "./functions/logging/info.js";

export { log } from "./functions/logging/log.js";

export type { Logger } from "./Logger.js";

export type { LogLevel } from "./types/LogLevel.js";

export { setGroupMode } from "./functions/state/setGroupMode.js";

export { setLogLevel } from "./functions/state/setLogLevel.js";

export { setTheme } from "./functions/state/setTheme.js";

export type { StyledExitHandle } from "./types/StyledExitHandle.js";

export type { Theme } from "./types/Theme.js";

// Themes
export { themes } from "./themes.js";

export { trace } from "./functions/logging/trace.js";

export { verbose } from "./functions/logging/verbose.js";

export { warn } from "./functions/logging/warn.js";
