# ReactTracer Runtime Settings

**Package:** `@autotracer/react19` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** Overview

---

Start here before changing individual settings in isolation.

## Tree Visibility

```mermaid
flowchart TB
  missing([Missing components]) --> maxDepth[maxFiberDepth]
  maxDepth --> branches[includeNonTrackedBranches]
  branches --> include[include* visibility]
  include --> empty[filterEmptyNodes]

  markers([Collapsed markers]) --> empty
  empty --> level[showLevelDetails]

  style include fill:#eef2ff,stroke:#4c6ef5,stroke-width:2px
  style empty fill:#fff4e6,stroke:#f08c00,stroke-width:2px
  style level fill:#fff4e6,stroke:#f08c00,stroke-width:2px
  style maxDepth fill:#e3fafc,stroke:#0c8599,stroke-width:2px
  style branches fill:#e3fafc,stroke:#0c8599,stroke-width:2px
  classDef symptom fill:#f8f9fa,stroke:#868e96,stroke-width:1.5px,color:#212529
  class missing,markers symptom;
```

## Trigger Sessions

```mermaid
flowchart TB
  stopped([Tracing starts or stays off]) --> enabled[enabled]
  enabled --> start[startTriggerFunctionName]
  start --> stop[endTriggerFunctionName]
  stop --> mode[endTriggerMode]
  stop --> rearm[triggerRearmMode]

  style enabled fill:#e6fcf5,stroke:#099268,stroke-width:2px
  style start fill:#e6fcf5,stroke:#099268,stroke-width:2px
  style stop fill:#e6fcf5,stroke:#099268,stroke-width:2px
  style mode fill:#e6fcf5,stroke:#099268,stroke-width:2px
  style rearm fill:#e6fcf5,stroke:#099268,stroke-width:2px
  classDef state fill:#f8f9fa,stroke:#868e96,stroke-width:1.5px,color:#212529
  class stopped state;
```

## Startup And Appearance

```mermaid
flowchart LR
  enabled[enabled] --- mode[outputMode]
  enabled --- theme[colors theme]
  files[Vite theme files] --> theme

  style enabled fill:#e6fcf5,stroke:#099268,stroke-width:2px
  style mode fill:#e3fafc,stroke:#0c8599,stroke-width:2px
  style theme fill:#fff0f6,stroke:#c2255c,stroke-width:2px
  style files fill:#fff0f6,stroke:#c2255c,stroke-width:2px
```

`include*` = [`includeMount`](./config/includeMount), [`includeRendered`](./config/includeRendered), [`includeReconciled`](./config/includeReconciled), and [`includeSkipped`](./config/includeSkipped).

## Prop Noise

Use [`skippedObjectProps`](./config/skippedObjectProps) when prop output is dominated by framework objects, styling props, or callback props that are not useful for the debugging question in front of you.

This setting only reduces ReactTracer prop-output noise for exact component-name matches. It is not meant for suppressing user identifiers in production environments.

## Non-Overrides

[`detectIdenticalValueChanges`](./config/detectIdenticalValueChanges) adds warnings only to nodes that are already visible. It does not override the `include*` visibility settings or [`filterEmptyNodes`](./config/filterEmptyNodes).

## Start Here

If components are missing, read [`maxFiberDepth`](./config/maxFiberDepth), [`includeNonTrackedBranches`](./config/includeNonTrackedBranches), the four `include*` visibility settings above, and then [`filterEmptyNodes`](./config/filterEmptyNodes).

If collapsed markers are confusing, read [`filterEmptyNodes`](./config/filterEmptyNodes) together with [`showLevelDetails`](./config/showLevelDetails).

If prop output is noisy, read [`skippedObjectProps`](./config/skippedObjectProps) before treating repeated prop churn as a meaningful signal.

If trigger-driven sessions behave unexpectedly, read [`enabled`](./config/enabled), [`startTriggerFunctionName`](./config/startTriggerFunctionName), [`endTriggerFunctionName`](./config/endTriggerFunctionName), [`endTriggerMode`](./config/endTriggerMode), and [`triggerRearmMode`](./config/triggerRearmMode) together.

If tracing starts correctly but the output format or styling is wrong for your workflow, read [`enabled`](./config/enabled), [`outputMode`](./config/outputMode), and [`colors`](./config/colors) together. If you use `@autotracer/plugin-vite-react19`, injected theme files can still override overlapping project defaults locally.

The remaining lower-priority settings mainly affect diagnostics or specialized workflows: [`showFlags`](./config/showFlags), [`internalLogLevel`](./config/internalLogLevel), and [`trackedStateResolution`](./config/trackedStateResolution).
