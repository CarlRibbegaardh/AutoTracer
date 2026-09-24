import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

const traverseDefault =
  typeof traverse === "function" ? traverse : (traverse as any).default;

const code = `const x = (element: React.JSX.Element) => <div />;`;

const ast = parse(code, {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
});

console.log(JSON.stringify(ast, null, 2));

traverseDefault(ast, {
  TSTypeReference(path: any) {
    console.log("\n=== TSTypeReference ===");
    console.log("typeName type:", path.node.typeName.type);
    if (t.isTSQualifiedName(path.node.typeName)) {
      console.log("Is TSQualifiedName");
      console.log("left type:", path.node.typeName.left.type);
      console.log("right type:", path.node.typeName.right.type);
      if (t.isTSQualifiedName(path.node.typeName.left)) {
        console.log("Left is also TSQualifiedName");
        console.log("left.left:", (path.node.typeName.left as any).left);
        console.log("left.right:", (path.node.typeName.left as any).right);
      }
    }
  }
});
