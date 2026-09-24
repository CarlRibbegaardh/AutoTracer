import type { StateChangeEntry } from "../buildStateChanges.js";
import { getLabelsForGuid } from "../../../../hookLabels.js";
import type { LabelEntry } from "../../../../hookLabels/LabelEntry.js";

/**
 * Infers nested hook labels by matching unlabeled hook values against
 * properties in labeled object values, using a multi-pass recursive approach.
 *
 * When a component uses custom hooks (e.g., `const auth = useProvideAuth()`),
 * the internal `useState` calls from `useProvideAuth` appear in the component's
 * fiber hook chain as unlabeled hooks. This function:
 * 1. Detects when a labeled hook's value is a plain object (e.g., `auth: {user, loading}`)
 * 2. Matches unlabeled hook values against properties in that object
 * 3. Requires BOTH current and previous values to match (conservative approach)
 * 4. Recursively processes newly labeled entries to handle deep nesting
 * 5. Detects getter properties (e.g., `form.formState`) that reference internal hooks
 * 6. Labels remaining unknowns that match inferred objects as `parent.unknown`
 *
 * The multi-pass approach handles cases like Redux selectors where:
 * - `usersByDept` is labeled from the variable
 * - An internal hook holds `usersByDept.Engineering` (inferred in pass 2)
 * - Another internal hook duplicates `usersByDept` entirely (labeled as `usersByDept.unknown`)
 *
 * The getter detection handles hook containers like react-hook-form where:
 * - `useForm()` returns `{formState, control, register, ...}`
 * - `formState` is a getter property defined via `Object.defineProperty`
 * - The getter accesses an internal `useState` hook
 * - The internal hook is labeled as `form.formState` instead of `unknown`
 *
 * @param entries - Array of state change entries to process
 * @returns New array with inferred labels applied (does not mutate input)
 *
 * @example
 * // Input entries:
 * [
 *   { name: "unknown", value: null },           // from useState in useProvideAuth
 *   { name: "unknown", value: true },           // from useState in useProvideAuth
 *   { name: "auth", value: {user: null, loading: true} }
 * ]
 * // Output entries:
 * [
 *   { name: "auth.user", value: null },
 *   { name: "auth.loading", value: true },
 *   { name: "auth", value: {user: null, loading: true} }
 * ]
 *
 * @example
 * // Redux selector with internal state duplication:
 * [
 *   { name: "unknown", value: {Engineering: [...], Sales: [...]} },  // Redux internal state
 *   { name: "usersByDept", value: {Engineering: [...], Sales: [...]} }
 * ]
 * // Output:
 * [
 *   { name: "usersByDept.unknown", value: {Engineering: [...], Sales: [...]} },
 *   { name: "usersByDept", value: {Engineering: [...], Sales: [...]} }
 * ]
 *
 * @example
 * // react-hook-form with getter properties:
 * [
 *   { name: "unknown", value: {isDirty: false, errors: {}} },  // Internal formState hook
 *   { name: "form", value: {formState: <getter>, control: {}, register: fn} }
 * ]
 * // Output:
 * [
 *   { name: "form.formState", value: {isDirty: false, errors: {}} },
 *   { name: "form", value: {formState: <getter>, control: {}, register: fn} }
 * ]
 */
export function inferNestedHookLabels(
  entries: StateChangeEntry[],
  trackingGUID?: string | null
): StateChangeEntry[] {
  // Build value-to-label map recursively, processing in multiple passes
  // Pass 1: Direct labeled entries
  // Pass 2+: Entries inferred from previous passes
  let currentEntries = entries;
  let hasChanges = true;
  let iterationCount = 0;
  const maxIterations = 3; // Prevent infinite loops, allows usersByDept -> usersByDept.field -> usersByDept.field.unknown

  while (hasChanges && iterationCount < maxIterations) {
    hasChanges = false;
    iterationCount++;

    // Find all entries with labels (including previously inferred ones) that have plain object values
    const labeledObjects = currentEntries
      .filter((entry) => {
        return entry.name !== "unknown" && isPlainObject(entry.value);
      })
      .map((entry) => {
        return {
          label: entry.name,
          value: entry.value as Record<string, unknown>,
          prevValue: entry.prevValue,
        };
      });

    // If no labeled objects, nothing to infer
    if (labeledObjects.length === 0) {
      break;
    }

    // Build value-to-property map for all labeled objects
    // Include BOTH current and previous values so we can match during transitions
    const valueToPropertyPath = new Map<unknown, string>();

    for (const entry of labeledObjects) {
      const { label, value, prevValue } = entry;

      // Add current value properties
      for (const [key, propValue] of Object.entries(value)) {
        // Skip functions - they're often stable references (setters, callbacks)
        if (typeof propValue === "function") {
          continue;
        }

        // Use strict equality - we want exact value matches
        // Store the dotted path
        if (!valueToPropertyPath.has(propValue)) {
          valueToPropertyPath.set(propValue, `${label}.${key}`);
        }
      }

      // Also add previous value properties if available
      if (prevValue && isPlainObject(prevValue)) {
        const prevObj = prevValue as Record<string, unknown>;
        for (const [key, propValue] of Object.entries(prevObj)) {
          if (typeof propValue === "function") {
            continue;
          }
          if (!valueToPropertyPath.has(propValue)) {
            valueToPropertyPath.set(propValue, `${label}.${key}`);
          }
        }
      }
    }

    // Map entries, updating unlabeled ones that match BOTH current AND previous values.
    // This conservative approach only labels when the relationship is stable across
    // both states, reducing false positives from transient value matches.
    const nextEntries = currentEntries.map((entry) => {
      // Allow .internal labels to be upgraded by property-based matching
      const isInternalLabel = entry.name.endsWith(".internal");

      if (entry.name !== "unknown" && !isInternalLabel) {
        return entry;
      }

      const currentMatches = valueToPropertyPath.has(entry.value);
      const previousMatches =
        entry.prevValue !== undefined
          ? valueToPropertyPath.has(entry.prevValue)
          : true; // For mount (no prevValue), only check current

      if (currentMatches && previousMatches) {
        const upgradedLabel = valueToPropertyPath.get(entry.value)!;

        hasChanges = true;
        return {
          ...entry,
          name: upgradedLabel,
        };
      }

      return entry;
    });

    currentEntries = nextEntries;
  }

  // Pass for hook containers: Detect objects with getter properties that may reference internal hooks
  // This handles cases like react-hook-form where:
  // - form.formState is a getter property (or deeply nested like form.control._formState)
  // - The getter accesses an internal useState hook
  // - The internal hook appears as "unknown" at the component level
  const getterReferencedValues = new Map<unknown, string>();

  /**
   * Recursively scans an object and its nested objects for getter properties.
   * Maps the values returned by getters to their dotted property paths.
   */
  function scanForGetters(
    obj: Record<string, unknown>,
    pathPrefix: string,
    visited: Set<unknown> = new Set()
  ): void {
    // Prevent infinite recursion on circular references
    if (visited.has(obj)) {
      return;
    }
    visited.add(obj);

    for (const key of Object.keys(obj)) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      const fullPath = `${pathPrefix}.${key}`;

      // If this property has a getter, try to access it and map the returned value
      if (descriptor && typeof descriptor.get === "function") {
        try {
          const getterValue = obj[key];

          // Map this value to the property path
          // Skip if the value is undefined/null or a function
          if (getterValue != null && typeof getterValue !== "function") {
            getterReferencedValues.set(getterValue, fullPath);

            // If the getter returns a plain object, recursively scan it too
            if (isPlainObject(getterValue)) {
              scanForGetters(
                getterValue as Record<string, unknown>,
                fullPath,
                visited
              );
            }
          }
        } catch {
          // Getter might throw or have side effects, skip it
          continue;
        }
      } else if (descriptor && descriptor.value != null) {
        // For regular properties, if the value is a plain object, recurse into it
        const propValue = obj[key];
        if (isPlainObject(propValue) && typeof propValue !== "function") {
          scanForGetters(
            propValue as Record<string, unknown>,
            fullPath,
            visited
          );
        }
      }
    }
  }

  for (const entry of currentEntries) {
    if (entry.name === "unknown" || !isPlainObject(entry.value)) {
      continue;
    }

    const obj = entry.value as Record<string, unknown>;
    scanForGetters(obj, entry.name);
  }

  // Apply getter-based labels to unknowns
  const entriesWithGetterLabels = currentEntries.map((entry) => {
    if (entry.name !== "unknown") {
      return entry;
    }

    // Check if this unknown value is referenced by a getter property
    if (getterReferencedValues.has(entry.value)) {
      const label = getterReferencedValues.get(entry.value)!;
      return {
        ...entry,
        name: label,
      };
    }

    return entry;
  });

  // Final pass: For any remaining "unknown" entries, if their value is a plain object
  // that matches an inferred label's value exactly, append ".unknown" to show the relationship
  const inferredObjectValues = new Map<unknown, string>();
  for (const entry of entriesWithGetterLabels) {
    if (entry.name !== "unknown" && isPlainObject(entry.value)) {
      inferredObjectValues.set(entry.value, entry.name);
    }
  }

  return entriesWithGetterLabels
    .map((entry) => {
      if (entry.name !== "unknown") {
        return entry;
      }

      // Check if this unknown value matches an inferred object's value exactly
      if (inferredObjectValues.has(entry.value)) {
        const parentLabel = inferredObjectValues.get(entry.value)!;
        return {
          ...entry,
          name: `${parentLabel}.unknown`,
        };
      }

      return entry;
    })
    .map((entry, index) => {
      if (entry.name !== "unknown") {
        return entry;
      }

      // Final heuristic: If unknown is a non-array object AND there are custom hook containers,
      // label it as .internal of the CLOSEST container.
      // This handles internal state hooks from libraries like react-hook-form.
      // Prefer containers BEFORE this unknown (most recent), but allow AFTER if nothing before.

      // Find all custom hook containers
      const allCustomHooks = entriesWithGetterLabels
        .map((e, idx) => {
          return { entry: e, index: idx };
        })
        .filter(({ entry: e }) => {
          return e.name !== "unknown" && isCustomHookContainer(e.value);
        });

      // Split into before/after this unknown's position
      const customHooksBefore = allCustomHooks.filter(({ index: idx }) => {
        return idx < index;
      });
      const customHooksAfter = allCustomHooks.filter(({ index: idx }) => {
        return idx > index;
      });

      // Prefer BEFORE (most recent = last in array), then AFTER (closest = first in array)
      let chosenCustomHook:
        | { entry: { name: string; value: unknown }; index: number }
        | undefined;
      if (customHooksBefore.length > 0) {
        chosenCustomHook = customHooksBefore[customHooksBefore.length - 1]; // Most recent before
      } else if (customHooksAfter.length > 0) {
        chosenCustomHook = customHooksAfter[0]; // Closest after
      }

      // If no custom hooks in current entries, check stored labels (for updates)
      if (!chosenCustomHook) {
        const storedLabels = trackingGUID ? getLabelsForGuid(trackingGUID) : [];
        const storedCustomHook = storedLabels
          .filter((label: LabelEntry) => {
            return isCustomHookContainer(label.value);
          })
          .reverse()[0]; // Most recent
        if (storedCustomHook) {
          chosenCustomHook = {
            entry: {
              name: storedCustomHook.label,
              value: storedCustomHook.value,
            },
            index: -1,
          };
        }
      }

      // Only apply .internal heuristic when:
      // 1. At least one custom hook container exists
      // 2. The unknown value is NOT a primitive (primitives can't be internal hook state)
      // Note: Functions ARE allowed (they can be internal hooks like useCallback results)
      const isPrimitive =
        entry.value === null ||
        entry.value === undefined ||
        typeof entry.value === "string" ||
        typeof entry.value === "number" ||
        typeof entry.value === "boolean" ||
        typeof entry.value === "bigint" ||
        typeof entry.value === "symbol";

      if (chosenCustomHook && !isPrimitive) {
        const parentLabel = chosenCustomHook.entry.name;

        return {
          ...entry,
          name: `${parentLabel}.internal`,
        };
      }

      return entry;
    });
}

/**
 * Detects if a labeled value looks like a custom hook container (e.g., form object, store).
 * Custom hooks often return objects with methods, not just data.
 *
 * @param value - The value to check
 * @returns True if value looks like a custom hook container
 */
function isCustomHookContainer(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  // Check if object has any function properties (methods)
  // Custom hooks like useForm() return objects with methods like register, handleSubmit, etc.
  const entries = Object.entries(value);
  const hasMethods = entries.some(([_, val]) => {
    return typeof val === "function";
  });

  return hasMethods;
}

/**
 * Checks if a value is a plain object (not null, not array, not class instance).
 *
 * @param value - Value to check
 * @returns True if value is a plain object
 */
function isPlainObject(value: unknown): boolean {
  if (value === null || typeof value !== "object") {
    return false;
  }

  // Reject arrays
  if (Array.isArray(value)) {
    return false;
  }

  // Accept objects with Object.prototype or no prototype (Object.create(null))
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
