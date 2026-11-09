import { configureStore } from "@reduxjs/toolkit";
import tripsReducer from "./tripsSlice";
import registrationsReducer from "./registrationsSlice";
import activitiesReducer from "./activitiesSlice";

export const store = configureStore({
  reducer: {
    trips: tripsReducer,
    registrations: registrationsReducer,
    activities: activitiesReducer,
  },
});
