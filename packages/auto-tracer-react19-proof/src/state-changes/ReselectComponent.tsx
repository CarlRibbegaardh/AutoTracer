import React, { useMemo } from "react";
import { Provider } from "react-redux";
import { createAppStore } from "./reselect/store";
import { ReselectInner } from "./reselect/ReselectInner";

/**
 * Component wrapper with Redux Provider.
 * Demonstrates reselect memoized selectors with simple and complex data.
 */
export const ReselectComponent: React.FC<{
  testStore?: ReturnType<typeof createAppStore>;
}> = ({ testStore }) => {
  const defaultStore = useMemo(() => createAppStore(), []);
  const store = testStore || defaultStore;
  return (
    <Provider store={store}>
      <ReselectInner />
    </Provider>
  );
};
