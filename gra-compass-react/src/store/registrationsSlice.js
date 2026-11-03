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

export const updateRegistration = createAsyncThunk(
  "registrations/updateRegistration",
  async ({ tripId, travelerNumber, registration }) => {
    const response = await fetch(
      `http://localhost:8080/api/trips/${tripId}/registrations/${travelerNumber}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registration),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update registration");
    }

    return {
      tripId,
      registration: await response.json(),
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
      })
      .addCase(updateRegistration.fulfilled, (state, action) => {
        const { tripId, registration } = action.payload;
        const registrations = state.byTrip[tripId];

        if (!registrations) {
          return;
        }

        const index = registrations.findIndex(
          (item) => item.travelerNumber === registration.travelerNumber,
        );

        if (index !== -1) {
          registrations[index] = registration;
        }
      });
  },
});

export default registrationsSlice.reducer;
