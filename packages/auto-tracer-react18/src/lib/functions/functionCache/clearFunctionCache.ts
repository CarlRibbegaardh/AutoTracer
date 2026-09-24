import { getTraceOptions } from "../../types/globalState.js";
import { globalCache } from "./withCache.js";
import type { CacheEntry } from "./types/CacheEntry.js";
import { internalLogger } from "../../../logger/internalLogger.js";

/**
 * Statistics for a single argument combination with per-caller access counts.
 */
interface ArgumentStats {
  functionName: string;
  args: unknown[];
  timeMs: number;
  callerHits: Map<string, number>;
}

/**
 * Recursively walks a nested Map structure to extract cache entries.
 *
 * @param node Current node in the nested structure
 * @param pathSoFar Arguments accumulated in the path to this node
 * @param results Array to collect stats
 */
function walkCacheNode(
  node: unknown,
  pathSoFar: unknown[],
  results: ArgumentStats[]
): void {
  if (node instanceof Map) {
    // Intermediate Map level - recurse into each entry
    for (const [key, value] of node) {
      walkCacheNode(value, [...pathSoFar, key], results);
    }
  } else {
    // Leaf node - this is a CacheEntry
    const entry = node as CacheEntry<unknown>;
    if (entry.meta) {
      results.push({
        functionName: entry.meta.functionName,
        args: entry.meta.args,
        timeMs: entry.meta.firstComputeTimeMs,
        callerHits: entry.meta.callerAccess,
      });
    }
  }
}

/**
 * Formats argument values for display in the console table.
 * Handles special cases like objects, arrays, functions.
 *
 * @param args Array of argument values
 * @returns Human-readable string representation
 */
function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (arg === null) return "null";
      if (arg === undefined) return "undefined";
      if (typeof arg === "string") return `"${arg}"`;
      if (typeof arg === "number" || typeof arg === "boolean")
        return String(arg);
      if (typeof arg === "function") return "[Function]";
      if (Array.isArray(arg)) return `[Array(${arg.length})]`;
      if (typeof arg === "object") return "[Object]";
      return String(arg);
    })
    .join(", ");
}

/**
 * Logs cache statistics with hierarchical format showing per-caller breakdown.
 * Groups by function name, then by argument combination, showing each caller's usage.
 */
function logCacheStats(): void {
  internalLogger.log("\n[auto-tracer] Function Cache Report:");

  // Collect all stats from all caches
  const allStats: ArgumentStats[] = [];
  for (const [, cache] of globalCache) {
    walkCacheNode(cache, [], allStats);
  }

  if (allStats.length === 0) {
    internalLogger.log("  No cached function calls this render cycle.");
    return;
  }

  // Group by function name
  const groupedByFunction = new Map<string, ArgumentStats[]>();
  for (const stat of allStats) {
    if (!groupedByFunction.has(stat.functionName)) {
      groupedByFunction.set(stat.functionName, []);
    }
    groupedByFunction.get(stat.functionName)!.push(stat);
  }

  // Log each function
  let grandTotalTimeSaved = 0;
  let grandTotalArgCombinations = 0;

  for (const [functionName, functionStats] of groupedByFunction) {
    internalLogger.log(`\n${functionName}:`);

    let functionTotalHits = 0;
    let functionTotalTimeSaved = 0;

    // Log each argument combination
    for (const stat of functionStats) {
      const argsStr = formatArgs(stat.args);
      internalLogger.log(
        `  Arguments: ${argsStr} (computed in ${stat.timeMs.toFixed(2)}ms)`
      );

      // Show per-caller breakdown
      let argTotalHits = 0;
      let argTimeSaved = 0;

      for (const [caller, hits] of stat.callerHits) {
        const callerTimeSaved = (hits - 1) * stat.timeMs;
        internalLogger.log(
          `    ${caller}: ${hits} hits (saved ${callerTimeSaved.toFixed(2)}ms)`
        );
        argTotalHits += hits;
        argTimeSaved += callerTimeSaved;
      }

      internalLogger.log(
        `    Total: ${argTotalHits} hits, saved ${argTimeSaved.toFixed(2)}ms`
      );

      functionTotalHits += argTotalHits;
      functionTotalTimeSaved += argTimeSaved;
    }

    internalLogger.log(
      `  Overall: ${
        functionStats.length
      } unique argument combinations, ${functionTotalHits} total hits, ${functionTotalTimeSaved.toFixed(
        2
      )}ms saved`
    );

    grandTotalTimeSaved += functionTotalTimeSaved;
    grandTotalArgCombinations += functionStats.length;
  }

  // Grand total summary
  internalLogger.log(
    `\nGrand Total: ${grandTotalArgCombinations} unique argument combinations across all functions`
  );
  internalLogger.log(
    `Total time saved by caching: ${grandTotalTimeSaved.toFixed(2)}ms\n`
  );
}

/**
 * Clears the global function cache and optionally logs statistics.
 * Called after each render cycle by ReactTracer.
 *
 * When `functionCacheLogging` is enabled:
 * - Walks all caches to collect statistics
 * - Groups results by function name and caller
 * - Logs detailed per-argument-combination metrics
 * - Shows cache hits, computation times, and time saved
 *
 * Then clears all cache entries to prevent memory leaks.
 */
export function clearFunctionCache(): void {
  if (getTraceOptions().functionCache && getTraceOptions().functionCacheLogging) {
    logCacheStats();
  }

  globalCache.clear();
}
