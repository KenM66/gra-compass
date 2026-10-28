import { configureStore } from "@reduxjs/toolkit";
import tripsReducer from "./tripsSlice";

export const store = configureStore({
  reducer: {
    trips: tripsReducer,
  },
});
