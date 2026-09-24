import { useState } from "react";

import { HmrProbe } from "./HmrProbe.js";
import "./styles.css";

/** Renders the focused React 19 state tracing proof. */
export function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="proof">
      <p className="eyebrow">AutoTracer injection acceptance</p>
      <h1>React 19 tracer proof</h1>
      <section className="counter" aria-labelledby="counter-heading">
        <h2 id="counter-heading">State counter</h2>
        <output className="count" data-testid="count" aria-live="polite">
          {count}
        </output>
        <button type="button" onClick={() => setCount((value) => value + 1)}>
          Increment
        </button>
      </section>
      <HmrProbe />
    </main>
  );
}
