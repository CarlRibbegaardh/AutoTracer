module.exports = {
  meta: {
    type: "problem",
    docs: { description: "Disallow any console.* usage" },
    messages: {
      noConsole: "Instead of console, use the @autotracer/logger package for logging. Loggers should be configured locally in a folder ./src/logger."
    }
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object &&
          node.object.name === "console"
        ) {
          context.report({ node, messageId: "noConsole" });
        }
      }
    };
  }
};
