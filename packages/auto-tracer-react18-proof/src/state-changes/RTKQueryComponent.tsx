import React, { useMemo } from "react";
import { Provider } from "react-redux";
import { createRTKQueryStore } from "./rtk-query/store";
import { RTKQueryInner } from "./rtk-query/RTKQueryInner";

/**
 * Component wrapper with Redux Provider.
 * Demonstrates RTK Query hook state tracking with complex queries and mutations.
 */
export const RTKQueryComponent: React.FC<{
  testStore?: ReturnType<typeof createRTKQueryStore>;
}> = ({ testStore }) => {
  const defaultStore = useMemo(() => createRTKQueryStore(), []);
  const store = testStore || defaultStore;
  return (
    <Provider store={store}>
      <RTKQueryInner />
    </Provider>
  );
};
