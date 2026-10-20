import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import tripsData from "../data/mockTrips";

export const fetchTrips = createAsyncThunk("trips/fetchTrips", async () => {
  const response = await fetch("http://localhost:8080/api/trips");

  if (!response.ok) {
    throw new Error("Failed to load trips");
  }

  return response.json();
});

const initialState = {
  items: tripsData,
  status: "idle",
  error: null,
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addTrip, updateTrip } = tripsSlice.actions;

export default tripsSlice.reducer;
