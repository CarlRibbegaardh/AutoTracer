/**
 * Redux store configuration for RTK Query.
 * Provides store with RTK Query middleware.
 */

import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";

/**
 * Creates a Redux store configured with RTK Query.
 * Includes the API reducer and middleware.
 */
export const createRTKQueryStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });
