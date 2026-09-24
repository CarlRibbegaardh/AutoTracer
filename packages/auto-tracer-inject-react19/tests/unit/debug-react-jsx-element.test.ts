import { describe, it, expect } from "vitest";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

const traverseDefault =
  typeof traverse === "function" ? traverse : (traverse as any).default;

describe("Debug React.JSX.Element parsing", () => {
  it("shows structure of React.JSX.Element", () => {
    const code = `const x = (element: React.JSX.Element) => <div />;`;

    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    let foundTypeRef = false;

    traverseDefault(ast, {
      TSTypeReference(path: any) {
        const typeName = path.node.typeName;
        console.log("\n=== TSTypeReference found ===");
        console.log("typeName type:", typeName.type);

        if (t.isTSQualifiedName(typeName)) {
          console.log("Is TSQualifiedName");
          console.log("left:", JSON.stringify(typeName.left, null, 2));
          console.log("right:", JSON.stringify(typeName.right, null, 2));

          if (t.isTSQualifiedName(typeName.left)) {
            console.log("\nLeft is ALSO TSQualifiedName!");
            console.log("left.left:", JSON.stringify(typeName.left.left, null, 2));
            console.log("left.right:", JSON.stringify(typeName.left.right, null, 2));

            if (
              t.isIdentifier(typeName.left.left) &&
              t.isIdentifier(typeName.left.right) &&
              t.isIdentifier(typeName.right)
            ) {
              console.log(`\nStructure: ${typeName.left.left.name}.${typeName.left.right.name}.${typeName.right.name}`);
            }
          }
        }

        foundTypeRef = true;
      }
    });

    expect(foundTypeRef).toBe(true);
  });
});
