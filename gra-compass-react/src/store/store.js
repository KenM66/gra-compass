import { configureStore } from "@reduxjs/toolkit";
import tripsReducer from "./tripsSlice";
import registrationsReducer from "./registrationsSlice";

export const store = configureStore({
  reducer: {
    trips: tripsReducer,
    registrations: registrationsReducer,
  },
});
