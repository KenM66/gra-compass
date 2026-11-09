import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchActivities = createAsyncThunk(
  "activities/fetchActivities",
  async (tripId) => {
    const response = await fetch(
      `http://localhost:8080/api/trips/${tripId}/activities`,
    );

    if (!response.ok) {
      throw new Error("Failed to load activities");
    }

    return response.json();
  },
);

const activitiesSlice = createSlice({
  name: "activities",

  initialState: {
    byTrip: {},
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.byTrip[action.meta.arg] = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default activitiesSlice.reducer;
