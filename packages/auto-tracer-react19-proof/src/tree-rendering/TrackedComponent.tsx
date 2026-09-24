import React, { useState } from "react";
import { useReactTracer } from "@autotracer/react19";

/**
 * Component demonstrating a tracked node with state changes.
 * This is a "non-empty" node that will appear in filtered output.
 */
export const TrackedComponent: React.FC = () => {
  const logger = useReactTracer();

  const [count, setCount] = useState(0);
  logger.labelState(0, "count", count, "setCount", setCount);

  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
