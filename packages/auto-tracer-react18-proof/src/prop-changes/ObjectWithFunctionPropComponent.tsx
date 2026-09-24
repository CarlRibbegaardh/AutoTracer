import React, { useState } from "react";
import { useReactTracer } from "@autotracer/react18";

/**
 * Hook that returns an object containing a function.
 * Returns a NEW function instance on every render.
 */
function useObjectWithFunction() {
  // This creates a new function on every render
  return {
    handler: () => {
      console.log("handler called");
    },
  };
}

/**
 * Component that uses a hook returning an object with a function property.
 * The function changes on every render, demonstrating the bug where
 * different function IDs show "(identical value)".
 */
export const ObjectWithFunctionPropComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  const config = useObjectWithFunction();

  useReactTracer();

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Increment: {count}
      </button>
      <ChildComponent config={config} />
    </div>
  );
};

interface ChildProps {
  config: {
    handler: () => void;
  };
}

const ChildComponent: React.FC<ChildProps> = ({ config }) => {
  useReactTracer();

  return (
    <div>
      <button onClick={config.handler}>Call Handler</button>
    </div>
  );
};
