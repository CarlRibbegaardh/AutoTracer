import { parse } from "@babel/parser";
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import type { TransformContext } from "../../interfaces/TransformContext.js";
import type { TransformResult } from "../../interfaces/TransformResult.js";
import type { ComponentInfo } from "../../interfaces/ComponentInfo.js";
import { isComponentFunction } from "../detect/isComponentFunction.js";
import { isPascalCase } from "../detect/helpers/isPascalCase.js";
import { extractComponentInfo } from "../detect/extractComponentInfo.js";
import { hasExistingUseReactTracerImport } from "../detect/hasExistingUseReactTracerImport.js";
import { shouldInstrumentComponent } from "../config/shouldInstrumentComponent.js";
import { shouldProcessFile } from "../config/shouldProcessFile.js";
import { getFunctionPragmas } from "@autotracer/filter-utils";
import { isClientComponentModule } from "../detect/isClientComponentModule.js";
import { unwrapFunctionFromHOCs } from "./helpers/unwrapFunctionFromHOCs.js";
import { injectUseReactTracer } from "./helpers/injectUseReactTracer.js";
import { injectUseReactTracerIntoFunction } from "./helpers/injectUseReactTracerIntoFunction.js";
import { addUseReactTracerImport } from "./helpers/addUseReactTracerImport.js";
import { returnsJSX } from "../detect/helpers/returnsJSX.js";

// Fix for Babel traverse and generate default export issues
const traverseDefault =
  typeof traverse === "function" ? traverse : (traverse as any).default;
const generateDefault =
  typeof generate === "function" ? generate : (generate as any).default;

/**
 * Transforms React component code to inject auto-tracing functionality.
 *
 * This function parses the provided TypeScript/JSX code, identifies React components,
 * and injects `useReactTracer` hooks along with `labelState` calls for configured hooks.
 * The transformation enables automatic tracking of component renders and state changes.
 *
 * @param code - The source code to transform
 * @param context - Transformation context containing filename and configuration
 * @returns The transformed code with injected tracing, or original code on error
 *
 * @example
 * ```typescript
 * const result = transform(`
 *   function MyComponent() {
 *     const [count, setCount] = useState(0);
 *     return <div>{count}</div>;
 *   }
 * `, {
 *   filename: 'MyComponent.tsx',
 *   config: {
 *     mode: 'opt-out',
 *     labelHooks: ['useState'],
 *     importSource: '@autotracer/react18'
 *   }
 * });
 * // Result includes injected useReactTracer and labelState calls
 * ```
 */
export function transform(
  code: string,
  context: TransformContext,
): TransformResult {
  const { config, filename } = context;
  const hookNameSet = new Set(
    (config.labelHooks || []).map((s) => s.trim()).filter(Boolean),
  );

  // Sanitize labelHooksPattern to remove common regex delimiter mistakes
  // Users often include /.../ thinking it's needed, but RegExp constructor expects just the pattern
  let sanitizedPattern = config.labelHooksPattern || "";
  if (sanitizedPattern) {
    // Remove leading/trailing slashes and flags (e.g., "/^use[A-Z].*/g" -> "^use[A-Z].*")
    sanitizedPattern = sanitizedPattern
      .replace(/^\//, "") // strip leading slash
      .replace(/\/[gimsuvy]*$/, ""); // strip trailing slash + flags
  }

  const hookNameRegex = sanitizedPattern ? new RegExp(sanitizedPattern) : null;
  const prefix = context.prefix || "";
  /** Prepends the configured island/app prefix to a component name. */
  const applyPrefix = (name: string): string =>
    prefix ? `${prefix}:${name}` : name;

  try {
    // Path eligibility: Check if file path matches include/exclude patterns
    if (!shouldProcessFile(filename, config)) {
      return { code, injected: false, components: [] };
    }

    // Parse the code
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    // RSC safety check: If serverComponents mode is on, only transform client components.
    if (config.serverComponents && !isClientComponentModule(ast)) {
      return { code, injected: false, components: [] };
    }

    const components: ComponentInfo[] = [];
    let hasInjected = false;
    let needsImport = false;
    let anonymousDefaultCount = 0;

    // Extract base filename for anonymous default export naming
    const baseFilename = filename
      ? filename
          .split(/[\\\/]/)
          .pop()
          ?.replace(/\.(tsx?|jsx?)$/, "") || "Component"
      : "Component";

    // Pragma support is function-level only (via leadingComments)
    // Each component can have @trace or @trace-disable before it

    // Check if import already exists
    const hasImport = hasExistingUseReactTracerImport(
      ast,
      config.importSource || "@autotracer/react18",
    );

    // Traverse and transform
    traverseDefault(ast, {
      FunctionDeclaration(path: any) {
        // Only process top-level function declarations (not nested inside other functions)
        const parent = path.parent;
        if (
          !t.isProgram(parent) &&
          !t.isExportNamedDeclaration(parent) &&
          !t.isExportDefaultDeclaration(parent)
        ) {
          return; // Skip nested function declarations
        }

        // Enhanced detection with path context and hook pattern
        if (isComponentFunction(path.node, path, hookNameRegex || undefined)) {
          // Extract component info first to get the name
          const componentInfo = extractComponentInfo(path.node);
          if (!componentInfo) {
            return; // Can't instrument if we can't get component info
          }

          // Check function-level pragmas
          const commentHost =
            t.isExportNamedDeclaration(path.parent) ||
            t.isExportDefaultDeclaration(path.parent)
              ? path.parent
              : path.node;
          const functionPragmas = getFunctionPragmas(commentHost);

          // Use centralized shouldInstrumentComponent for all filtering logic
          if (
            !shouldInstrumentComponent(
              componentInfo.name,
              functionPragmas,
              config,
            )
          ) {
            return; // Skip this component
          }

          components.push(componentInfo);
          injectUseReactTracer(
            path,
            applyPrefix(componentInfo.name),
            hookNameSet,
            hookNameRegex,
          );
          hasInjected = true;
          if (!hasImport) needsImport = true;
        }
      },
      VariableDeclarator(path: any) {
        // Only process top-level variable declarators (not nested inside functions)
        // Check if we're inside a function by walking up the parent chain
        let currentPath = path.parentPath;
        while (currentPath) {
          if (t.isFunction(currentPath.node)) {
            return; // Skip - this is a nested variable inside a function
          }
          if (t.isProgram(currentPath.node)) {
            break; // Reached top level - this is good
          }
          currentPath = currentPath.parentPath;
        }

        // Enhanced detection with path context and hook pattern
        if (isComponentFunction(path.node, path, hookNameRegex || undefined)) {
          // Extract component info first to get the name
          const componentInfo = extractComponentInfo(path.node);
          if (
            !componentInfo ||
            !path.node.init ||
            !t.isFunction(path.node.init)
          ) {
            return; // Can't instrument if we can't get component info or function init
          }

          // Check function-level pragmas for VariableDeclarator
          // For exported variables: export const X = () => {}
          //   Comments are on ExportNamedDeclaration (path.parentPath.parent)
          // For regular variables: const X = () => {}
          //   Comments are on VariableDeclaration (path.parentPath.node) — Babel attaches
          //   leading comments to the statement, not to the VariableDeclarator sub-node.
          const nodeWithComments =
            path.parentPath?.parent &&
            t.isExportNamedDeclaration(path.parentPath.parent)
              ? path.parentPath.parent
              : (path.parentPath?.node ?? path.node);
          const functionPragmas = getFunctionPragmas(nodeWithComments);

          // Use centralized shouldInstrumentComponent for all filtering logic
          if (
            !shouldInstrumentComponent(
              componentInfo.name,
              functionPragmas,
              config,
            )
          ) {
            return; // Skip this component
          }

          components.push(componentInfo);
          injectUseReactTracerIntoFunction(
            path.node.init,
            applyPrefix(componentInfo.name),
            hookNameSet,
            hookNameRegex,
          );
          hasInjected = true;
          if (!hasImport) needsImport = true;
        } else {
          // Handle HOC-wrapped components: const Name = memo(forwardRef(fn)) or similar
          const node: t.VariableDeclarator = path.node;
          if (
            t.isIdentifier(node.id) &&
            node.init &&
            t.isCallExpression(node.init)
          ) {
            const innerFn = unwrapFunctionFromHOCs(node.init, 0);
            if (innerFn) {
              const name = node.id.name;

              const nodeWithComments =
                path.parentPath?.parent &&
                t.isExportNamedDeclaration(path.parentPath.parent)
                  ? path.parentPath.parent
                  : (path.parentPath?.node ?? path.node);
              const functionPragmas = getFunctionPragmas(nodeWithComments);

              if (!shouldInstrumentComponent(name, functionPragmas, config)) {
                return;
              }

              // Trust HOC context: unwrapFunctionFromHOCs already validated this is a component context
              // No body content validation needed - prevents self-validation vulnerability
              // Only validate the wrapper variable name follows PascalCase convention
              if (!isPascalCase(name)) {
                // Reject: camelCase HOC wrappers are likely utilities, not components
                return;
              }

              // Context proven by HOC wrapper - safe to instrument
              components.push({ name, isAnonymous: false, node: innerFn });
              injectUseReactTracerIntoFunction(
                innerFn,
                applyPrefix(name),
                hookNameSet,
                hookNameRegex,
              );
              hasInjected = true;
              if (!hasImport) needsImport = true;
            }
          }
        }
      },
      ExportDefaultDeclaration(path: any) {
        const declaration = path.node.declaration;
        const functionPragmas = getFunctionPragmas(path.node);

        // Handle anonymous arrow functions: export default () => <div/>
        if (
          t.isArrowFunctionExpression(declaration) ||
          t.isFunctionExpression(declaration)
        ) {
          // Check if it returns JSX (anonymous functions don't need PascalCase check)
          if (returnsJSX(declaration)) {
            const proposedCount = anonymousDefaultCount + 1;
            const componentName =
              proposedCount === 1
                ? `${baseFilename}_default`
                : `${baseFilename}_default_${proposedCount}`;

            if (
              !shouldInstrumentComponent(componentName, functionPragmas, config)
            ) {
              return;
            }

            anonymousDefaultCount = proposedCount;

            components.push({
              name: componentName,
              isAnonymous: true,
              node: declaration,
              start: declaration.start ?? undefined,
              end: declaration.end ?? undefined,
            });

            injectUseReactTracerIntoFunction(
              declaration,
              applyPrefix(componentName),
              hookNameSet,
              hookNameRegex,
            );
            hasInjected = true;
            if (!hasImport) needsImport = true;
          }
        }
        // Handle anonymous function declarations: export default function() { return <div/> }
        else if (t.isFunctionDeclaration(declaration) && !declaration.id) {
          if (returnsJSX(declaration)) {
            const proposedCount = anonymousDefaultCount + 1;
            const componentName =
              proposedCount === 1
                ? `${baseFilename}_default`
                : `${baseFilename}_default_${proposedCount}`;

            if (
              !shouldInstrumentComponent(componentName, functionPragmas, config)
            ) {
              return;
            }

            anonymousDefaultCount = proposedCount;

            components.push({
              name: componentName,
              isAnonymous: true,
              node: declaration,
              start: declaration.start ?? undefined,
              end: declaration.end ?? undefined,
            });

            injectUseReactTracer(
              path.get("declaration"),
              applyPrefix(componentName),
              hookNameSet,
              hookNameRegex,
            );
            hasInjected = true;
            if (!hasImport) needsImport = true;
          }
        }
      },
    });

    // Add import if needed
    if (needsImport && hasInjected) {
      addUseReactTracerImport(
        ast,
        config.importSource || "@autotracer/react18",
      );
    }

    // Generate transformed code
    const result = generateDefault(ast, {
      retainLines: true,
      comments: true,
    });

    return {
      code: result.code,
      map: result.map,
      injected: hasInjected,
      components,
    };
  } catch (error) {
    // Return original code on parse/transform errors
    // console.warn(`Auto-trace transform failed for ${filename}:`, error);
    return { code, injected: false, components: [] };
  }
}
