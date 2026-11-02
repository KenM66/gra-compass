import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchRegistrationsByTrip = createAsyncThunk(
  "registrations/fetchRegistrationsByTrip",
  async (tripId) => {
    const response = await fetch(
      `http://localhost:8080/api/trips/${tripId}/registrations`,
    );

    if (!response.ok) {
      throw new Error("Failed to load registrations");
    }

    return {
      tripId,
      registrations: await response.json(),
    };
  },
);

const initialState = {
  byTrip: {},
  status: "idle",
  error: null,
};

const registrationsSlice = createSlice({
  name: "registrations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegistrationsByTrip.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRegistrationsByTrip.fulfilled, (state, action) => {
        const { tripId, registrations } = action.payload;

        state.status = "succeeded";
        state.byTrip[tripId] = registrations;
      })
      .addCase(fetchRegistrationsByTrip.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default registrationsSlice.reducer;
