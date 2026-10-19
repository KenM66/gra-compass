import { createSlice } from "@reduxjs/toolkit";
import tripsData from "../data/mockTrips";

const initialState = {
  items: tripsData,
};

const tripsSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    addTrip: (state, action) => {
      state.items.push(action.payload);
    },

    updateTrip: (state, action) => {
      const { id, changes } = action.payload;

      const trip = state.items.find((trip) => trip.id === id);

      if (trip) {
        Object.assign(trip, changes);
      }
    },
  },
});

export const { addTrip, updateTrip } = tripsSlice.actions;

export default tripsSlice.reducer;
