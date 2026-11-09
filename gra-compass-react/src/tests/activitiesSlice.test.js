import { describe, expect, it, vi } from "vitest";
import activitiesReducer, { fetchActivities } from "../store/activitiesSlice";

describe("activitiesSlice", () => {
  it("starts with an empty activities state", () => {
    const state = activitiesReducer(undefined, {
      type: "unknown",
    });

    expect(state).toEqual({
      byTrip: {},
      loading: false,
      error: null,
    });
  });
  it("sets loading to true when fetching activities", () => {
    const initialState = activitiesReducer(undefined, {
      type: "unknown",
    });

    const action = fetchActivities.pending("request123", "trip123");

    const state = activitiesReducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.byTrip).toEqual({});
  });
  it("stores fetched activities under the correct trip ID", () => {
    const initialState = {
      byTrip: {},
      loading: true,
      error: null,
    };

    const activities = [
      {
        id: "activity456",
        tripId: "trip123",
        type: "Excursion",
        name: "Catamaran & Snorkeling",
        sessions: [],
      },
    ];

    const action = fetchActivities.fulfilled(
      activities,
      "request123",
      "trip123",
    );

    const state = activitiesReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.byTrip["trip123"]).toEqual(activities);
  });

  it("handles failed activity requests", () => {
    const existingActivities = [
      {
        id: "activity456",
        tripId: "trip123",
        type: "Excursion",
        name: "Catamaran & Snorkeling",
        sessions: [],
      },
    ];

    const initialState = {
      byTrip: {
        trip123: existingActivities,
      },
      loading: true,
      error: null,
    };

    const action = fetchActivities.rejected(
      new Error("Failed to load activities"),
      "request123",
      "trip123",
    );

    const state = activitiesReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to load activities");
    expect(state.byTrip["trip123"]).toEqual(existingActivities);
  });

  it("fetches activities from the backend API", async () => {
    const tripId = "trip123";

    const activities = [
      {
        id: "activity456",
        tripId,
        type: "Excursion",
        name: "Catamaran & Snorkeling",
        sessions: [],
      },
    ];

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => activities,
    });

    try {
      const dispatch = vi.fn();

      const getState = () => ({});

      const result = await fetchActivities(tripId)(
        dispatch,
        getState,
        undefined,
      );

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8080/api/trips/trip123/activities",
      );

      expect(result.type).toBe("activities/fetchActivities/fulfilled");
      expect(result.payload).toEqual(activities);
    } finally {
      fetchMock.mockRestore();
    }
  });
  it("rejects the request when the backend returns an HTTP error", async () => {
    const tripId = "trip123";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    });

    try {
      const dispatch = vi.fn();
      const getState = () => ({});

      const result = await fetchActivities(tripId)(
        dispatch,
        getState,
        undefined,
      );

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8080/api/trips/trip123/activities",
      );

      expect(result.type).toBe("activities/fetchActivities/rejected");
      expect(result.error.message).toBe("Failed to load activities");
    } finally {
      fetchMock.mockRestore();
    }
  });
});
