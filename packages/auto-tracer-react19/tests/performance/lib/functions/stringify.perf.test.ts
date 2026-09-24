/* eslint-disable local-rules/no-console-disallow */
/**
 * @file Performance tests for stringify using captured fiber fixtures
 */

import { beforeAll, describe, expect, test } from "vitest";
import { stringify } from "@src/lib/functions/stringify";
import { parse } from "flatted";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { internalLogger } from "@logger/internalLogger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURES_DIR = join(__dirname, "../../../fixtures");

describe("stringify performance with fiber fixtures", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fixture: any;

  beforeAll(() => {
    console.log("Reading file");
    const flattedContent = readFileSync(
      join(
        FIXTURES_DIR,
        "fiber-fixture-NavigationTabs-1763833233761.fixture.flatted"
      ),
      "utf8"
    );
    console.log("Parsing file");
    fixture = parse(flattedContent);
  });

  test("BASELINE: capture stringify output for NavigationTabs fiber", () => {
    internalLogger.setLogLevel("trace");

    console.log("Stringifying file");
    const result = stringify(fixture);

    console.log("Writing output file");
    writeFileSync(
      join(
        FIXTURES_DIR,
        "fiber-fixture-NavigationTabs-1763833233761.fixture.stringified.txt"
      ),
      result
    );
  });

  test("stringify NavigationTabs fiber matches baseline and performs well", () => {
    const expected = readFileSync(
      join(
        FIXTURES_DIR,
        "fiber-fixture-NavigationTabs-1763833233761.fixture.stringified.txt"
      ),
      "utf8"
    );

    const start = performance.now();
    const result = stringify(fixture);
    const elapsed = performance.now() - start;

    // Performance logging in test context
    // eslint-disable-next-line no-restricted-syntax
    console.log(`stringify elapsed time: ${elapsed.toFixed(2)}ms`);

    expect(result).toBe(expected);
    expect(elapsed).toBeLessThan(100);
  });
});
