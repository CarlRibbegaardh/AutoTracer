# AutoTracer agent skills

Skills for integrating AutoTracer, running an action or test, and explaining its function execution, React state changes, and renders. Use them to explore working code as well as diagnose bugs.

Agents normally capture traces in local development and tests. For QA-only issues, the developer usually captures the issue in their browser and shares the output with the agent for analysis.

Install from this repository:

```bash
npx skills@latest add CarlRibbegaardh/autotracer
```

The installer discovers these skills:

- `autotracer-integrate` installs or repairs ReactTracer and FlowTracer and verifies that a known target produces output.
- `autotracer-investigate` captures and analyzes application behavior after AutoTracer is working.

Install one skill directly by selecting it when prompted or by passing `--skill autotracer-integrate` or `--skill autotracer-investigate`.

Typical questions:

> What happens in this code?

> Why doesn't this validation run?

> Why does this state change?

> How can we optimize the rendering of this page?

The user describes the question. The agent can use AutoTracer to observe the execution needed to answer it: function calls and values, event handlers, or React renders and state changes. If setup is needed, integration hands off to investigation after verifying that tracing works. Both skills include local recipes; the agent still needs access to the project and a way to run it and collect output.

See [Use With an AI Agent](../packages/auto-tracer-docs/guide/agents.md) and [Your First Trace](../packages/auto-tracer-docs/guide/first-trace.md).
