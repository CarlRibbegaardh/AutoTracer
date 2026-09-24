# `skippedObjectProps`

**Package:** `@autotracer/react19` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `{ objectName: string; propNames: string[] }[]` &nbsp;·&nbsp; **Default:** `[]`

---

`skippedObjectProps` is a runtime configuration option for `reactTracer()` - the initializer of the `@autotracer/react19` React component render tracing library. It omits specific prop names from ReactTracer prop output for a matching component.

Matching uses exact component-name equality against `objectName`. When a component name matches, every prop listed in `propNames` is omitted from both initial prop output on mount and prop-change output on updates for that component.

Use this to reduce trace noise from framework props, styling props, or callback props that are not useful for the current debugging task.

Do not use this as a production redaction or privacy control. It only changes what ReactTracer prints and is not meant for suppressing user identifiers in production environments.

## Usage

```typescript
import { reactTracer } from "@autotracer/react19";

reactTracer({
  skippedObjectProps: [{ objectName: "ThemeProvider", propNames: ["theme"] }],
});
```
