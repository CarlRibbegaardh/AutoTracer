import { useState } from "react";

/** Renders the stateful Fast Refresh acceptance probe. */
export function HmrProbe() {
  const [probeCount, setProbeCount] = useState(0);

  return (
    <section className="counter" aria-labelledby="hmr-heading">
      <h2 id="hmr-heading" data-testid="hmr-marker">
        HMR baseline
      </h2>
      <output className="count" data-testid="hmr-count" aria-live="polite">
        {probeCount}
      </output>
      <button
        type="button"
        onClick={() => setProbeCount((value) => value + 1)}
      >
        Increment HMR probe
      </button>
    </section>
  );
}
