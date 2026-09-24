import { configureStore } from "@reduxjs/toolkit";
import { tasksApi } from "./api/tasksApi";
import { placesApi } from "./api/placesApi";
import { weatherApi } from "./api/weatherApi";
import { uiReducer } from "./slices/uiSlice";

/**
 * Configure the Redux store
 */
export const createStore = () =>
  configureStore({
    reducer: {
      [tasksApi.reducerPath]: tasksApi.reducer,
      [placesApi.reducerPath]: placesApi.reducer,
      [weatherApi.reducerPath]: weatherApi.reducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        tasksApi.middleware,
        placesApi.middleware,
        weatherApi.middleware,
      ),
  });

export const store = createStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
