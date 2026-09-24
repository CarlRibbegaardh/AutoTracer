---
layout: home

hero:
  name: AutoTracer
  text: Automated Tracing for JavaScript and React
  tagline: Keep your code free of console.logs; see exactly what happened
  actions:
    - theme: brand
      text: Capture Your First Trace
      link: /guide/first-trace
    - theme: alt
      text: Use With an AI Agent
      link: /guide/agents
    - theme: alt
      text: Already Installed? Capture an Action
      link: /guide/capture/

features:
  - icon: 🔍
    title: FlowTracer - Function & Code Flow
    details: Trace function calls, track execution flow, and see labeled variables without manual logging.

  - icon: ⚛️
    title: ReactTracer - Component Renders
    details: Trace component renders with labeled state/props. See what changed and when without manual logging.

  - icon: 🎛️
    title: Dashboard - Browser Control
    details: Keep tracing dormant in internal browser builds, then start, target, and stop capture windows from an in-app widget.

  - icon: 🛠️
    title: Tooling Support
    details: Vite, Webpack, Next.js (Pages/App Router), Create React App. Choose build-time integration plus a runtime package.

  - icon: 📦
    title: Ecosystem of Packages
    details: Modular design with separate runtime, build plugins, and utilities. Use what you need, skip what you don't.

  - icon: 🏷️
    title: Human-Readable Labels
    details: See "count 0 → 1" instead of minified variable references. Build-time injection resolves variable names automatically.
---

## From an Action to an Explanation

Choose an interaction or test, select the source to instrument, run it, and collect the trace. Use FlowTracer to inspect function calls and values, and ReactTracer to inspect component activity, props, and state.

The [first-trace walkthrough](/guide/first-trace) connects a button click to a function return, a state change, and a React render. It includes build configuration, runtime initialization, start/stop commands, and the signals to verify.

For an existing integration, choose [browser capture](/guide/capture/browser), [browser test capture](/guide/capture/browser-tests), or [FlowTracer in Vitest](/guide/capture/flow-vitest). Then [explain the observed execution](/guide/capture/analyze), whether it is working as intended or showing a bug.

AutoTracer observes selected source during a capture window. It does not automatically record every statement or connect events across runtimes. The [analysis guide](/guide/capture/analyze) explains what the output establishes and where further evidence is needed.

## Choose Your Path

<div class="vp-feature-grid">
  <div class="vp-feature">
    <h3>🔍 I want to trace function execution</h3>
    <p>Use <strong>FlowTracer</strong> for general code flow debugging</p>
    <a href="/guide/quickstart-flow">Get Started →</a>
  </div>

  <div class="vp-feature">
    <h3>⚛️ I want to trace React renders</h3>
    <p>Use <strong>ReactTracer</strong> for component render debugging</p>
    <a href="/guide/quickstart-react19">React 19 →</a>
    <a href="/guide/quickstart-react">React 18 →</a>
  </div>

  <div class="vp-feature">
    <h3>🎯 I want both</h3>
    <p>Observe function execution and React updates in the same capture</p>
    <a href="/guide/introduction">Learn More →</a>
  </div>
</div>

## Packages

| Package                                                       | Description                            | npm                                                                                                                                         |
| ------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [@autotracer/react19](/api/react19)                           | React 19 component render tracer       | [![npm](https://img.shields.io/npm/v/@autotracer/react19.svg)](https://www.npmjs.com/package/@autotracer/react19)                           |
| [@autotracer/react18](/api/react18)                           | React component render tracer runtime  | [![npm](https://img.shields.io/npm/v/@autotracer/react18.svg)](https://www.npmjs.com/package/@autotracer/react18)                           |
| [@autotracer/flow](/api/flow)                                 | Function and code flow tracer runtime  | [![npm](https://img.shields.io/npm/v/@autotracer/flow.svg)](https://www.npmjs.com/package/@autotracer/flow)                                 |
| [@autotracer/plugin-vite-react19](/api/plugin-vite-react19)   | Vite plugin for React 19 injection     | [![npm](https://img.shields.io/npm/v/@autotracer/plugin-vite-react19.svg)](https://www.npmjs.com/package/@autotracer/plugin-vite-react19)   |
| [@autotracer/plugin-vite-react18](/api/plugin-vite-react18)   | Vite plugin for ReactTracer injection  | [![npm](https://img.shields.io/npm/v/@autotracer/plugin-vite-react18.svg)](https://www.npmjs.com/package/@autotracer/plugin-vite-react18)   |
| [@autotracer/plugin-babel-react19](/api/plugin-babel-react19) | Babel plugin for React 19 injection    | [![npm](https://img.shields.io/npm/v/@autotracer/plugin-babel-react19.svg)](https://www.npmjs.com/package/@autotracer/plugin-babel-react19) |
| [@autotracer/plugin-babel-react18](/api/plugin-babel-react18) | Babel plugin for ReactTracer injection | [![npm](https://img.shields.io/npm/v/@autotracer/plugin-babel-react18.svg)](https://www.npmjs.com/package/@autotracer/plugin-babel-react18) |
| [@autotracer/plugin-vite-flow](/api/plugin-vite-flow)         | Vite plugin for FlowTracer injection   | [![npm](https://img.shields.io/npm/v/@autotracer/plugin-vite-flow.svg)](https://www.npmjs.com/package/@autotracer/plugin-vite-flow)         |
| [@autotracer/plugin-babel-flow](/api/plugin-babel-flow)       | Babel plugin for FlowTracer injection  | [![npm](https://img.shields.io/npm/v/@autotracer/plugin-babel-flow.svg)](https://www.npmjs.com/package/@autotracer/plugin-babel-flow)       |
| [@autotracer/dashboard](/dashboard/reference)                 | Browser dashboard for targeted control | [![npm](https://img.shields.io/npm/v/@autotracer/dashboard.svg)](https://www.npmjs.com/package/@autotracer/dashboard)                       |
| [@autotracer/logger](/api/logger)                             | Internal shared logger utility         | [![npm](https://img.shields.io/npm/v/@autotracer/logger.svg)](https://www.npmjs.com/package/@autotracer/logger)                             |
