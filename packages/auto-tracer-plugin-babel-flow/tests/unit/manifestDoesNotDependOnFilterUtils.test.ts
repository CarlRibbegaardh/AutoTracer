/// <reference types="node" />

import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Ensures this package does not ship an install-time dependency on `@autotracer/filter-utils`.
 */
const assertDoesNotDependOnFilterUtils = (): void => {
  const raw = readFileSync(resolve(pkgRoot, "package.json"), "utf8");
  const manifest: unknown = JSON.parse(raw);

  const dependencies: unknown =
    typeof manifest === "object" && manifest !== null
      ? Reflect.get(manifest, "dependencies")
      : undefined;

  const hasFilterUtils: boolean =
    typeof dependencies === "object" && dependencies !== null
      ? Reflect.has(dependencies, "@autotracer/filter-utils")
      : false;

  expect(hasFilterUtils).toBe(false);
};

/**
 * Ensures this package does not ship type declarations that reference `@autotracer/filter-utils`.
 *
 * Side effects: reads built `.d.ts` files from `dist/` when present.
 */
const assertTypeDeclarationsDoNotReferenceFilterUtils = (): void => {
  const declarationPaths: ReadonlyArray<string> = [
    resolve(pkgRoot, "dist/index.d.ts"),
    resolve(pkgRoot, "dist/helpers.d.ts"),
    resolve(pkgRoot, "dist/normalizeConfig.d.ts"),
    resolve(pkgRoot, "dist/transform.d.ts"),
  ];

  const existingDeclarationPaths: ReadonlyArray<string> = declarationPaths.filter((p) =>
    existsSync(p),
  );

  const combinedDeclarationContent: string = existingDeclarationPaths
    .map((p) => readFileSync(p, "utf8"))
    .join("\n");

  const hasFilterUtilsReference: boolean = combinedDeclarationContent.includes(
    "@autotracer/filter-utils",
  );

  expect(hasFilterUtilsReference).toBe(false);
};

/**
 * Ensures the built JS bundle does not contain a bare import of `@autotracer/filter-utils`.
 *
 * Side effects: reads `dist/index.js` when present; fails if the file is absent.
 */
const assertBundledJsDoesNotImportFilterUtils = (): void => {
  const jsPath = resolve(pkgRoot, "dist/index.js");
  expect(existsSync(jsPath), `Built file ${jsPath} must exist — run pnpm build first`).toBe(true);
  const content = readFileSync(jsPath, "utf8");
  expect(content.includes("@autotracer/filter-utils")).toBe(false);
};

describe("package.json manifest", () => {
  it("does not depend on @autotracer/filter-utils", assertDoesNotDependOnFilterUtils);
  it(
    "does not reference @autotracer/filter-utils in built type declarations",
    assertTypeDeclarationsDoNotReferenceFilterUtils,
  );
  it("does not import @autotracer/filter-utils in the built JS bundle", assertBundledJsDoesNotImportFilterUtils);
});
