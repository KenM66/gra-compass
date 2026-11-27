import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it, vi } from "vitest";

import registrationsReducer, {
  switchTravelerActivitySession,
  switchGuestActivitySession,
} from "../../store/registrationsSlice";

const TRIP_ID = "trip123";
const TRAVELER_NUMBER = 1047;
const ACTIVITY_ID = "activity123";
const CURRENT_SESSION_ID = 1;
const NEW_SESSION_ID = 2;

const BASE_URL = `http://localhost:8080/api/trips/${TRIP_ID}/registrations/${TRAVELER_NUMBER}`;

const switchArguments = {
  tripId: TRIP_ID,
  travelerNumber: TRAVELER_NUMBER,
  activityId: ACTIVITY_ID,
  currentSessionId: CURRENT_SESSION_ID,
  newSessionId: NEW_SESSION_ID,
};

const originalRegistration = {
  id: "registration123",
  tripId: TRIP_ID,
  travelerNumber: TRAVELER_NUMBER,
  firstName: "Robert",
  lastName: "Henderson",
  activities: [
    {
      activityId: ACTIVITY_ID,
      sessionId: CURRENT_SESSION_ID,
    },
  ],
  guest: {
    firstName: "Amanda",
    lastName: "Henderson",
    activities: [
      {
        activityId: ACTIVITY_ID,
        sessionId: CURRENT_SESSION_ID,
      },
    ],
  },
};

const updatedTravelerRegistration = {
  ...originalRegistration,
  activities: [
    {
      activityId: ACTIVITY_ID,
      sessionId: NEW_SESSION_ID,
    },
  ],
};

const updatedGuestRegistration = {
  ...originalRegistration,
  guest: {
    ...originalRegistration.guest,
    activities: [
      {
        activityId: ACTIVITY_ID,
        sessionId: NEW_SESSION_ID,
      },
    ],
  },
};

const createTestStore = () =>
  configureStore({
    reducer: {
      registrations: registrationsReducer,
    },
    preloadedState: {
      registrations: {
        byTrip: {
          [TRIP_ID]: [structuredClone(originalRegistration)],
        },
        status: "succeeded",
        error: null,
      },
    },
  });

const mockSuccessfulResponse = (registration) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => registration,
    }),
  );
};

const mockConflictResponse = () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
    }),
  );
};

const getStoredRegistration = (store) =>
  store.getState().registrations.byTrip[TRIP_ID][0];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("registrationsSlice", () => {
  describe("switchTravelerActivitySession", () => {
    it("calls the atomic traveler session switching endpoint", async () => {
      const store = createTestStore();

      mockSuccessfulResponse(updatedTravelerRegistration);

      const result = await store.dispatch(
        switchTravelerActivitySession(switchArguments),
      );

      expect(switchTravelerActivitySession.fulfilled.match(result)).toBe(true);

      expect(fetch).toHaveBeenCalledTimes(1);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/activities/${ACTIVITY_ID}/sessions/${CURRENT_SESSION_ID}/switch/${NEW_SESSION_ID}`,
        {
          method: "PUT",
        },
      );
    });

    it("updates the traveler reservation while preserving guest selections", async () => {
      const store = createTestStore();

      mockSuccessfulResponse(updatedTravelerRegistration);

      await store
        .dispatch(switchTravelerActivitySession(switchArguments))
        .unwrap();

      const registration = getStoredRegistration(store);

      expect(registration).toEqual(updatedTravelerRegistration);

      expect(registration.activities).toEqual([
        {
          activityId: ACTIVITY_ID,
          sessionId: NEW_SESSION_ID,
        },
      ]);

      expect(registration.guest).toEqual(originalRegistration.guest);
    });

    it("rejects a traveler session switch when the API returns HTTP 409", async () => {
      const store = createTestStore();

      mockConflictResponse();

      const result = await store.dispatch(
        switchTravelerActivitySession(switchArguments),
      );

      expect(switchTravelerActivitySession.rejected.match(result)).toBe(true);

      expect(result.error.message).toBe(
        "Failed to switch traveler activity session (409)",
      );

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("preserves existing registration state when a traveler switch fails", async () => {
      const store = createTestStore();

      mockConflictResponse();

      await expect(
        store.dispatch(switchTravelerActivitySession(switchArguments)).unwrap(),
      ).rejects.toMatchObject({
        message: "Failed to switch traveler activity session (409)",
      });

      expect(getStoredRegistration(store)).toEqual(originalRegistration);
    });
  });

  describe("switchGuestActivitySession", () => {
    it("calls the atomic guest session switching endpoint", async () => {
      const store = createTestStore();

      mockSuccessfulResponse(updatedGuestRegistration);

      const result = await store.dispatch(
        switchGuestActivitySession(switchArguments),
      );

      expect(switchGuestActivitySession.fulfilled.match(result)).toBe(true);

      expect(fetch).toHaveBeenCalledTimes(1);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/guest/activities/${ACTIVITY_ID}/sessions/${CURRENT_SESSION_ID}/switch/${NEW_SESSION_ID}`,
        {
          method: "PUT",
        },
      );
    });

    it("updates the guest reservation while preserving traveler selections", async () => {
      const store = createTestStore();

      mockSuccessfulResponse(updatedGuestRegistration);

      await store
        .dispatch(switchGuestActivitySession(switchArguments))
        .unwrap();

      const registration = getStoredRegistration(store);

      expect(registration).toEqual(updatedGuestRegistration);

      expect(registration.guest.activities).toEqual([
        {
          activityId: ACTIVITY_ID,
          sessionId: NEW_SESSION_ID,
        },
      ]);

      expect(registration.activities).toEqual(originalRegistration.activities);
    });

    it("rejects a guest session switch when the API returns HTTP 409", async () => {
      const store = createTestStore();

      mockConflictResponse();

      const result = await store.dispatch(
        switchGuestActivitySession(switchArguments),
      );

      expect(switchGuestActivitySession.rejected.match(result)).toBe(true);

      expect(result.error.message).toBe(
        "Failed to switch guest activity session (409)",
      );

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("preserves existing registration state when a guest switch fails", async () => {
      const store = createTestStore();

      mockConflictResponse();

      await expect(
        store.dispatch(switchGuestActivitySession(switchArguments)).unwrap(),
      ).rejects.toMatchObject({
        message: "Failed to switch guest activity session (409)",
      });

      expect(getStoredRegistration(store)).toEqual(originalRegistration);
    });
  });
});
