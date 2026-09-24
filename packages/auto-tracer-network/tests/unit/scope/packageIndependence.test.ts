import { globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = fileURLToPath(new URL("../../../", import.meta.url));

/**
 * Reads the package manifest and all TypeScript production sources.
 *
 * @returns Package text inspected by dependency tests.
 */
function readPackageText(): string {
  const manifest = readFileSync(resolve(packageRoot, "package.json"), "utf8");
  const source = globSync("src/**/*.ts", { cwd: packageRoot })
    .map((relativePath) => {
      return readFileSync(resolve(packageRoot, relativePath), "utf8");
    })
    .join("\n");

  return `${manifest}\n${source}`;
}

describe("NetworkTracer package independence", () => {
  it("[NET-SCOPE-004] has no dependency on React or Flow tracers", () => {
    expect(readPackageText()).not.toMatch(
      /@autotracer\/(?:react18|react19|flow)/,
    );
  });

  it("[NET-SCOPE-006] has no Babel dependency or production import", () => {
    expect(readPackageText()).not.toMatch(/(?:@babel\/|babel-core)/i);
  });
});
