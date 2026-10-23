import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import tripsData from "../data/mockTrips";

export const fetchTrips = createAsyncThunk("trips/fetchTrips", async () => {
  const response = await fetch("http://localhost:8080/api/trips");

  if (!response.ok) {
    throw new Error("Failed to load trips");
  }

  return response.json();
});

export const createTrip = createAsyncThunk("trips/createTrip", async (trip) => {
  const response = await fetch("http://localhost:8080/api/trips", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trip),
  });

  if (!response.ok) {
    throw new Error("Failed to create trip");
  }

  return response.json();
});

export const saveTrip = createAsyncThunk(
  "trips/saveTrip",
  async ({ id, changes }) => {
    const response = await fetch(`http://localhost:8080/api/trips/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(changes),
    });

    if (!response.ok) {
      throw new Error("Failed to update trip");
    }

    return response.json();
  }
);

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
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(saveTrip.fulfilled, (state, action) => {
        const updatedTrip = action.payload;

        const index = state.items.findIndex(
          (trip) => trip.id === updatedTrip.id
        );

        if (index !== -1) {
          state.items[index] = updatedTrip;
        }
      });
  },
});

export const { addTrip, updateTrip } = tripsSlice.actions;

export default tripsSlice.reducer;
