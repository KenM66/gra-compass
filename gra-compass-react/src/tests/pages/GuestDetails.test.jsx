import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import GuestDetails from "../../pages/GuestDetails";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import registrationsReducer from "../../store/registrationsSlice";
import activitiesReducer from "../../store/activitiesSlice";

const registration = {
  travelerNumber: 1047,
  firstName: "Robert",
  lastName: "Henderson",
  email: "robert@example.com",
  activities: [],
  guest: {
    firstName: "Amanda",
    preferredName: "",
    lastName: "Henderson",
    sex: "Female",
    email: "amanda@example.com",
    phone: "216-555-0123",
    dateOfBirth: "1988-09-22",
    airport: "CLE",
    passportNumber: "987654321",
    passportExpiration: "2031-05-18",
    accessibility: "Wheelchair-accessible transportation",
    dietaryRequirements: "None",
    activities: [],
  },
};

const activitiesByTrip = {
  1: [
    {
      id: "6af110ca493edddec267fe9b",
      tripId: "1",
      type: "Excursion",
      name: "Catamaran & Snorkeling",
      sessions: [
        {
          id: 1,
          date: "2027-03-09",
          time: "10:00:00",
          maxCapacity: 21,
          reservedCount: 0,
          active: true,
        },
        {
          id: 2,
          date: "2027-03-09",
          time: "14:00:00",
          maxCapacity: 25,
          reservedCount: 0,
          active: true,
        },
      ],
    },
    {
      id: "2",
      tripId: "1",
      type: "Excursion",
      name: "Island Jeep Tour",
      sessions: [
        {
          id: 201,
          date: "2027-03-10",
          time: "09:00:00",
          maxCapacity: 20,
          reservedCount: 0,
          active: true,
        },
      ],
    },
  ],
};

const registrationsByTrip = {
  1: [registration],
};

const renderGuestDetails = (
  testRegistrationsByTrip = registrationsByTrip,
  testActivitiesByTrip = activitiesByTrip,
) => {
  const store = configureStore({
    reducer: {
      registrations: registrationsReducer,
      activities: activitiesReducer,
    },
    preloadedState: {
      registrations: {
        byTrip: testRegistrationsByTrip,
        status: "idle",
        error: null,
      },
      activities: {
        byTrip: testActivitiesByTrip,
        loading: false,
        error: null,
      },
    },
  });

  vi.stubGlobal(
    "fetch",
    vi.fn((url) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url.endsWith("/activities")
              ? (testActivitiesByTrip[1] ?? [])
              : (testRegistrationsByTrip[1] ?? []),
          ),
      }),
    ),
  );

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/trips/1/registrations/1047/guest"]}>
        <Routes>
          <Route
            path="/trips/:tripId/registrations/:id/guest"
            element={<GuestDetails />}
          />
          <Route
            path="/trips/:tripId/registrations/:id"
            element={<div>Traveler Details Page</div>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return store;
};

describe("GuestDetails", () => {
  test("displays the guest for the correct traveler", () => {
    renderGuestDetails();

    expect(
      screen.getByRole("heading", {
        name: "Guest Information",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Guest of Traveler #1047")).toBeInTheDocument();

    expect(screen.getByText("Amanda")).toBeInTheDocument();
    expect(screen.getByText("Henderson")).toBeInTheDocument();
    expect(screen.getByText("amanda@example.com")).toBeInTheDocument();
  });
  test("shows a message when the traveler has no guest", () => {
    const registrationWithoutGuest = {
      ...registration,
      guest: null,
    };

    const testRegistrationsByTrip = {
      1: [registrationWithoutGuest],
    };

    renderGuestDetails(testRegistrationsByTrip);

    expect(
      screen.getByRole("heading", {
        name: "Guest Information",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No guest information is currently available."),
    ).toBeInTheDocument();
  });
  test("shows registration not found when the traveler does not exist", () => {
    const testRegistrationsByTrip = {
      1: [],
    };

    renderGuestDetails(testRegistrationsByTrip);

    expect(
      screen.getByRole("heading", {
        name: "Registration Not Found",
      }),
    ).toBeInTheDocument();
  });
  test("allows guest personal information to be edited and saved", async () => {
    const user = userEvent.setup();

    renderGuestDetails();

    globalThis.fetch.mockImplementation((url, options) => {
      if (options?.method === "PUT") {
        return Promise.resolve({
          ok: true,
          json: async () => JSON.parse(options.body),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => registrationsByTrip[1],
      });
    });

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[0]);

    const firstNameInput = screen.getByDisplayValue("Amanda");
    const emailInput = screen.getByDisplayValue("amanda@example.com");

    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Mandy");

    await user.clear(emailInput);
    await user.type(emailInput, "mandy@example.com");

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/trips/1/registrations/1047",
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );
    });

    const putCall = globalThis.fetch.mock.calls.find(
      ([, options]) => options?.method === "PUT",
    );

    const updatedRegistration = JSON.parse(putCall[1].body);

    expect(updatedRegistration.guest.firstName).toBe("Mandy");
  });
  test("cancels guest personal information changes without saving", async () => {
    const user = userEvent.setup();

    renderGuestDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[0]);

    const firstNameInput = screen.getByDisplayValue("Amanda");

    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Princess Consuela");

    expect(screen.getByDisplayValue("Princess Consuela")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(
      globalThis.fetch.mock.calls.some(
        ([, options]) => options?.method === "PUT",
      ),
    ).toBe(false);

    expect(
      screen.queryByDisplayValue("Princess Consuela"),
    ).not.toBeInTheDocument();

    expect(screen.getByText("Amanda")).toBeInTheDocument();
  });
  test("converts the guest departure airport to uppercase while editing", async () => {
    const user = userEvent.setup();

    renderGuestDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[1]);

    const airportInput = screen.getByDisplayValue("CLE");

    await user.clear(airportInput);
    await user.type(airportInput, "lax");

    expect(airportInput).toHaveValue("LAX");
  });
  test("saves updated guest travel information", async () => {
    const user = userEvent.setup();

    renderGuestDetails();

    globalThis.fetch.mockImplementation((url, options) => {
      if (options?.method === "PUT") {
        return Promise.resolve({
          ok: true,
          json: async () => JSON.parse(options.body),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => registrationsByTrip[1],
      });
    });

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[1]);

    const airportInput = screen.getByDisplayValue("CLE");
    const passportInput = screen.getByDisplayValue("987654321");

    await user.clear(airportInput);
    await user.type(airportInput, "jfk");

    await user.clear(passportInput);
    await user.type(passportInput, "ABC123456");

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/trips/1/registrations/1047",
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );
    });

    const putCall = globalThis.fetch.mock.calls.find(
      ([, options]) => options?.method === "PUT",
    );

    const updatedRegistration = JSON.parse(putCall[1].body);

    expect(updatedRegistration.guest.airport).toBe("JFK");
    expect(updatedRegistration.guest.passportNumber).toBe("ABC123456");
    expect(updatedRegistration.guest.passportExpiration).toBe("2031-05-18");

    expect(updatedRegistration.guest.departureAirport).toBeUndefined();

    expect(updatedRegistration.firstName).toBe("Robert");
    expect(updatedRegistration.email).toBe("robert@example.com");
    expect(updatedRegistration.travelerNumber).toBe(1047);
  });
  test("saves updated guest accessibility and dietary information", async () => {
    const user = userEvent.setup();

    renderGuestDetails();

    globalThis.fetch.mockImplementation((url, options) => {
      if (options?.method === "PUT") {
        return Promise.resolve({
          ok: true,
          json: async () => JSON.parse(options.body),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => registrationsByTrip[1],
      });
    });

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[2]);

    const accessibilityInput = screen.getByDisplayValue(
      "Wheelchair-accessible transportation",
    );

    const dietaryInput = screen.getByDisplayValue("None");

    await user.clear(accessibilityInput);
    await user.type(accessibilityInput, "Accessible hotel room");

    await user.clear(dietaryInput);
    await user.type(dietaryInput, "Peanut allergy");

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/trips/1/registrations/1047",
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );
    });

    const putCall = globalThis.fetch.mock.calls.find(
      ([, options]) => options?.method === "PUT",
    );

    const updatedRegistration = JSON.parse(putCall[1].body);

    expect(updatedRegistration.guest.accessibility).toBe(
      "Accessible hotel room",
    );

    expect(updatedRegistration.guest.dietaryRequirements).toBe(
      "Peanut allergy",
    );

    expect(updatedRegistration.guest.dietaryRestrictions).toBeUndefined();

    expect(updatedRegistration.guest.firstName).toBe("Amanda");
    expect(updatedRegistration.guest.airport).toBe("CLE");

    expect(updatedRegistration.firstName).toBe("Robert");
    expect(updatedRegistration.email).toBe("robert@example.com");
    expect(updatedRegistration.travelerNumber).toBe(1047);
  });
  test("disables reservations when the backend reports a full session", async () => {
    const user = userEvent.setup();

    const fullActivitiesByTrip = {
      1: activitiesByTrip[1].map((activity) => ({
        ...activity,
        sessions: activity.sessions.map((session) =>
          activity.name === "Island Jeep Tour" && session.id === 201
            ? {
                ...session,
                reservedCount: session.maxCapacity,
              }
            : session,
        ),
      })),
    };

    renderGuestDetails(registrationsByTrip, fullActivitiesByTrip);

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[3]);

    const fullSession = screen.getByRole("radio", {
      name: /Wednesday, March 10.*9:00 AM.*Full/i,
    });

    expect(fullSession).toBeDisabled();
  });

  test("saves guest activity selections through the backend API", async () => {
    const user = userEvent.setup();

    const store = renderGuestDetails();

    const originalRegistration = registrationsByTrip[1].find(
      (registration) => registration.travelerNumber === 1047,
    );

    const updatedRegistration = {
      ...originalRegistration,
      guest: {
        ...originalRegistration.guest,
        activities: [
          {
            activityId: "2",
            type: "Excursion",
            name: "Island Jeep Tour",
            sessionId: 201,
          },
        ],
      },
    };

    const updatedActivities = activitiesByTrip[1].map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) =>
        activity.id === "2" && session.id === 201
          ? {
              ...session,
              reservedCount: session.reservedCount + 1,
            }
          : session,
      ),
    }));

    let reservationSaved = false;

    globalThis.fetch.mockImplementation(async (url, options) => {
      if (
        url ===
          "http://localhost:8080/api/trips/1/registrations/1047/guest/activities/2/sessions/201" &&
        options?.method === "PUT"
      ) {
        reservationSaved = true;

        return {
          ok: true,
          json: async () => updatedRegistration,
        };
      }

      if (url === "http://localhost:8080/api/trips/1/activities") {
        return {
          ok: true,
          json: async () =>
            reservationSaved ? updatedActivities : activitiesByTrip[1],
        };
      }

      if (url === "http://localhost:8080/api/trips/1/registrations") {
        return {
          ok: true,
          json: async () =>
            reservationSaved
              ? registrationsByTrip[1].map((registration) =>
                  registration.travelerNumber === 1047
                    ? updatedRegistration
                    : registration,
                )
              : registrationsByTrip[1],
        };
      }

      throw new Error(`Unexpected API request: ${url}`);
    });

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[3]);

    const activityCheckbox = screen.getByRole("checkbox", {
      name: /Excursion: Island Jeep Tour/i,
    });

    await user.click(activityCheckbox);

    const sessionRadio = screen.getByRole("radio", {
      name: /Wednesday, March 10.*9:00 AM/i,
    });

    await user.click(sessionRadio);

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/trips/1/registrations/1047/guest/activities/2/sessions/201",
        expect.objectContaining({
          method: "PUT",
        }),
      );
    });

    const putCall = globalThis.fetch.mock.calls.find(
      ([, options]) => options?.method === "PUT",
    );

    expect(putCall).toBeDefined();
    expect(putCall[1].body).toBeUndefined();

    await waitFor(() => {
      const savedRegistration = store
        .getState()
        .registrations.byTrip[1].find(
          (registration) => registration.travelerNumber === 1047,
        );

      expect(savedRegistration.guest.activities).toEqual([
        {
          activityId: "2",
          type: "Excursion",
          name: "Island Jeep Tour",
          sessionId: 201,
        },
      ]);

      expect(savedRegistration.activities).toEqual(
        originalRegistration.activities,
      );

      expect(store.getState().activities.byTrip[1]).toEqual(updatedActivities);

      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        "http://localhost:8080/api/trips/1/registrations",
      );
    });
  });

  test("cancels an existing guest activity reservation", async () => {
    const user = userEvent.setup();

    const catamaranSelection = {
      activityId: "6af110ca493edddec267fe9b",
      type: "Excursion",
      name: "Catamaran & Snorkeling",
      sessionId: 1,
    };

    const existingRegistration = {
      ...registration,
      activities: [catamaranSelection],
      guest: {
        ...registration.guest,
        activities: [catamaranSelection],
      },
    };

    const existingActivities = activitiesByTrip[1].map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) =>
        activity.id === catamaranSelection.activityId && session.id === 1
          ? { ...session, reservedCount: 2 }
          : session,
      ),
    }));

    const store = renderGuestDetails(
      { 1: [existingRegistration] },
      { 1: existingActivities },
    );

    const updatedRegistration = {
      ...existingRegistration,
      guest: {
        ...existingRegistration.guest,
        activities: [],
      },
    };

    const updatedActivities = existingActivities.map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) =>
        activity.id === catamaranSelection.activityId && session.id === 1
          ? { ...session, reservedCount: 1 }
          : session,
      ),
    }));

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[3]);

    const activityCheckbox = screen.getByRole("checkbox", {
      name: /Excursion: Catamaran & Snorkeling/i,
    });

    expect(activityCheckbox).toBeChecked();

    await user.click(activityCheckbox);

    expect(activityCheckbox).not.toBeChecked();

    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedRegistration,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedActivities,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [updatedRegistration],
      });

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/trips/1/registrations/1047/guest/activities/6af110ca493edddec267fe9b/sessions/1",
        { method: "DELETE" },
      );

      const savedRegistration = store
        .getState()
        .registrations.byTrip[1].find((item) => item.travelerNumber === 1047);

      expect(savedRegistration.guest.activities).toEqual([]);

      expect(savedRegistration.activities).toEqual([catamaranSelection]);

      expect(store.getState().activities.byTrip[1]).toEqual(updatedActivities);

      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        "http://localhost:8080/api/trips/1/registrations",
      );

      expect(screen.getByText("No trip selections.")).toBeInTheDocument();
    });
  });

  test("switches an existing guest activity reservation to another session", async () => {
    const user = userEvent.setup();

    const originalSelection = {
      activityId: "6af110ca493edddec267fe9b",
      type: "Excursion",
      name: "Catamaran & Snorkeling",
      sessionId: 1,
    };

    const existingRegistration = {
      ...registration,
      activities: [originalSelection],
      guest: {
        ...registration.guest,
        activities: [originalSelection],
      },
    };

    const existingActivities = activitiesByTrip[1].map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) =>
        activity.id === originalSelection.activityId && session.id === 1
          ? { ...session, reservedCount: 2 }
          : session,
      ),
    }));

    const store = renderGuestDetails(
      { 1: [existingRegistration] },
      { 1: existingActivities },
    );

    const canceledRegistration = {
      ...existingRegistration,
      guest: {
        ...existingRegistration.guest,
        activities: [],
      },
    };

    const updatedSelection = {
      ...originalSelection,
      sessionId: 2,
    };

    const updatedRegistration = {
      ...existingRegistration,
      guest: {
        ...existingRegistration.guest,
        activities: [updatedSelection],
      },
    };

    const updatedActivities = existingActivities.map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) =>
        activity.id === originalSelection.activityId
          ? {
              ...session,
              reservedCount: 1,
            }
          : session,
      ),
    }));

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[3]);

    const morningSession = screen.getByRole("radio", {
      name: /Tuesday, March 9.*10:00 AM/i,
    });

    const afternoonSession = screen.getByRole("radio", {
      name: /Tuesday, March 9.*2:00 PM/i,
    });

    expect(morningSession).toBeChecked();
    expect(afternoonSession).not.toBeChecked();

    await user.click(afternoonSession);

    expect(morningSession).not.toBeChecked();
    expect(afternoonSession).toBeChecked();

    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => canceledRegistration,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedRegistration,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedActivities,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [updatedRegistration],
      });

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    await waitFor(() => {
      const mutationCalls = globalThis.fetch.mock.calls.filter(
        ([, options]) =>
          options?.method === "DELETE" || options?.method === "PUT",
      );

      expect(mutationCalls).toEqual([
        [
          "http://localhost:8080/api/trips/1/registrations/1047/guest/activities/6af110ca493edddec267fe9b/sessions/1",
          { method: "DELETE" },
        ],
        [
          "http://localhost:8080/api/trips/1/registrations/1047/guest/activities/6af110ca493edddec267fe9b/sessions/2",
          { method: "PUT" },
        ],
      ]);

      const savedRegistration = store
        .getState()
        .registrations.byTrip[1].find((item) => item.travelerNumber === 1047);

      expect(savedRegistration.guest.activities).toEqual([updatedSelection]);

      expect(savedRegistration.activities).toEqual([originalSelection]);

      expect(store.getState().activities.byTrip[1]).toEqual(updatedActivities);

      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        "http://localhost:8080/api/trips/1/registrations",
      );
    });
  });

  test("recovers when a guest session switch partially fails", async () => {
    const user = userEvent.setup();

    const originalSelection = {
      activityId: "6af110ca493edddec267fe9b",
      type: "Excursion",
      name: "Catamaran & Snorkeling",
      sessionId: 1,
    };

    const existingRegistration = {
      ...registration,
      activities: [originalSelection],
      guest: {
        ...registration.guest,
        activities: [originalSelection],
      },
    };

    const existingActivities = activitiesByTrip[1].map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) =>
        activity.id === originalSelection.activityId && session.id === 1
          ? { ...session, reservedCount: 2 }
          : session,
      ),
    }));

    const store = renderGuestDetails(
      { 1: [existingRegistration] },
      { 1: existingActivities },
    );

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    try {
      const editButtons = screen.getAllByRole("button", {
        name: "Edit",
      });

      await user.click(editButtons[3]);

      const morningSession = screen.getByRole("radio", {
        name: /Tuesday, March 9.*10:00 AM/i,
      });

      const afternoonSession = screen.getByRole("radio", {
        name: /Tuesday, March 9.*2:00 PM/i,
      });

      expect(morningSession).toBeChecked();

      await user.click(afternoonSession);

      expect(afternoonSession).toBeChecked();

      const canceledRegistration = {
        ...existingRegistration,
        guest: {
          ...existingRegistration.guest,
          activities: [],
        },
      };

      const updatedActivities = existingActivities.map((activity) => ({
        ...activity,
        sessions: activity.sessions.map((session) => {
          if (activity.id !== originalSelection.activityId) {
            return session;
          }

          if (session.id === 1) {
            return {
              ...session,
              reservedCount: session.reservedCount - 1,
            };
          }

          if (session.id === 2) {
            return {
              ...session,
              reservedCount: session.maxCapacity,
            };
          }

          return session;
        }),
      }));

      globalThis.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => canceledRegistration,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => updatedActivities,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [canceledRegistration],
        });

      await user.click(
        screen.getByRole("button", {
          name: "Save",
        }),
      );

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();

        expect(
          screen.getByRole("button", {
            name: "Save",
          }),
        ).toBeEnabled();

        expect(
          screen.getByRole("button", {
            name: "Cancel",
          }),
        ).toBeEnabled();

        expect(morningSession).toBeEnabled();
        expect(afternoonSession).toBeDisabled();

        const savedRegistration = store
          .getState()
          .registrations.byTrip[1].find((item) => item.travelerNumber === 1047);

        expect(savedRegistration).toEqual(canceledRegistration);

        expect(savedRegistration.guest.activities).toEqual([]);

        expect(savedRegistration.activities).toEqual([originalSelection]);

        expect(store.getState().activities.byTrip[1]).toEqual(
          updatedActivities,
        );

        expect(globalThis.fetch).toHaveBeenLastCalledWith(
          "http://localhost:8080/api/trips/1/registrations",
        );
      });

      const mutationCalls = globalThis.fetch.mock.calls.filter(
        ([, options]) =>
          options?.method === "PUT" || options?.method === "DELETE",
      );

      expect(mutationCalls).toEqual([
        [
          "http://localhost:8080/api/trips/1/registrations/1047/guest/activities/6af110ca493edddec267fe9b/sessions/1",
          { method: "DELETE" },
        ],
        [
          "http://localhost:8080/api/trips/1/registrations/1047/guest/activities/6af110ca493edddec267fe9b/sessions/2",
          { method: "PUT" },
        ],
      ]);

      await user.click(morningSession);

      expect(morningSession).toBeChecked();
      expect(afternoonSession).not.toBeChecked();
    } finally {
      alertSpy.mockRestore();
    }
  });

  test("saves multiple guest activity reservations in one operation", async () => {
    const user = userEvent.setup();

    const catamaranSelection = {
      activityId: "6af110ca493edddec267fe9b",
      type: "Excursion",
      name: "Catamaran & Snorkeling",
      sessionId: 1,
    };

    const jeepSelection = {
      activityId: "2",
      type: "Excursion",
      name: "Island Jeep Tour",
      sessionId: 201,
    };

    const store = renderGuestDetails();

    const firstUpdatedRegistration = {
      ...registration,
      guest: {
        ...registration.guest,
        activities: [catamaranSelection],
      },
    };

    const finalUpdatedRegistration = {
      ...registration,
      guest: {
        ...registration.guest,
        activities: [catamaranSelection, jeepSelection],
      },
    };

    const updatedActivities = activitiesByTrip[1].map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) =>
        (activity.id === catamaranSelection.activityId && session.id === 1) ||
        (activity.id === jeepSelection.activityId && session.id === 201)
          ? { ...session, reservedCount: 1 }
          : session,
      ),
    }));

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[3]);

    await user.click(
      screen.getByRole("checkbox", {
        name: /Excursion: Catamaran & Snorkeling/i,
      }),
    );

    await user.click(
      screen.getByRole("radio", {
        name: /Tuesday, March 9.*10:00 AM/i,
      }),
    );

    await user.click(
      screen.getByRole("checkbox", {
        name: /Excursion: Island Jeep Tour/i,
      }),
    );

    await user.click(
      screen.getByRole("radio", {
        name: /Wednesday, March 10.*9:00 AM/i,
      }),
    );

    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => firstUpdatedRegistration,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => finalUpdatedRegistration,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedActivities,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [finalUpdatedRegistration],
      });

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    await waitFor(() => {
      const mutationCalls = globalThis.fetch.mock.calls.filter(
        ([, options]) =>
          options?.method === "PUT" || options?.method === "DELETE",
      );

      expect(mutationCalls).toEqual([
        [
          "http://localhost:8080/api/trips/1/registrations/1047/guest/activities/6af110ca493edddec267fe9b/sessions/1",
          { method: "PUT" },
        ],
        [
          "http://localhost:8080/api/trips/1/registrations/1047/guest/activities/2/sessions/201",
          { method: "PUT" },
        ],
      ]);

      const savedRegistration = store
        .getState()
        .registrations.byTrip[1].find((item) => item.travelerNumber === 1047);

      expect(savedRegistration.guest.activities).toEqual([
        catamaranSelection,
        jeepSelection,
      ]);

      expect(savedRegistration.activities).toEqual(registration.activities);

      expect(store.getState().activities.byTrip[1]).toEqual(updatedActivities);

      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        "http://localhost:8080/api/trips/1/registrations",
      );
    });
  });

  test("disables guest trip selection controls while a reservation is saving", async () => {
    const user = userEvent.setup();

    const store = renderGuestDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[3]);

    const jeepTourCheckbox = screen.getByRole("checkbox", {
      name: /Island Jeep Tour/i,
    });

    await user.click(jeepTourCheckbox);

    const jeepTourSession = screen.getByRole("radio", {
      name: /Wednesday, March 10.*9:00 AM/i,
    });

    await user.click(jeepTourSession);

    const jeepTour = {
      activityId: "2",
      type: "Excursion",
      name: "Island Jeep Tour",
      sessionId: 201,
    };

    const updatedRegistration = {
      ...registration,
      guest: {
        ...registration.guest,
        activities: [jeepTour],
      },
    };

    const updatedActivities = activitiesByTrip[1].map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) =>
        activity.id === "2" && session.id === 201
          ? {
              ...session,
              reservedCount: session.reservedCount + 1,
            }
          : session,
      ),
    }));

    let resolveReservation;

    const pendingReservation = new Promise((resolve) => {
      resolveReservation = resolve;
    });

    globalThis.fetch
      .mockReturnValueOnce(pendingReservation)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedActivities,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [updatedRegistration],
      });

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    const savingButton = screen.getByRole("button", {
      name: "Saving...",
    });

    const cancelButton = screen.getByRole("button", {
      name: "Cancel",
    });

    expect(savingButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();

    screen.getAllByRole("checkbox").forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });

    screen.getAllByRole("radio").forEach((radio) => {
      expect(radio).toBeDisabled();
    });

    await user.click(savingButton);
    await user.click(cancelButton);
    await user.click(jeepTourCheckbox);
    await user.click(jeepTourSession);

    expect(jeepTourCheckbox).toBeChecked();
    expect(jeepTourSession).toBeChecked();

    const mutationCalls = globalThis.fetch.mock.calls.filter(
      ([, options]) =>
        options?.method === "PUT" || options?.method === "DELETE",
    );

    expect(mutationCalls).toEqual([
      [
        "http://localhost:8080/api/trips/1/registrations/1047/guest/activities/2/sessions/201",
        { method: "PUT" },
      ],
    ]);

    resolveReservation({
      ok: true,
      json: async () => updatedRegistration,
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: "Saving...",
        }),
      ).not.toBeInTheDocument();

      const savedRegistration = store.getState().registrations.byTrip[1][0];

      expect(savedRegistration.guest.activities).toEqual([jeepTour]);

      expect(savedRegistration.activities).toEqual(registration.activities);

      expect(store.getState().activities.byTrip[1]).toEqual(updatedActivities);

      expect(
        screen.getAllByRole("button", {
          name: "Edit",
        })[3],
      ).toBeEnabled();

      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        "http://localhost:8080/api/trips/1/registrations",
      );
    });
  });

  test("recovers when a guest activity reservation fails", async () => {
    const user = userEvent.setup();

    const store = renderGuestDetails();

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    try {
      const editButtons = screen.getAllByRole("button", {
        name: "Edit",
      });

      await user.click(editButtons[3]);

      const jeepTourCheckbox = screen.getByRole("checkbox", {
        name: /Island Jeep Tour/i,
      });

      await user.click(jeepTourCheckbox);

      const jeepTourSession = screen.getByRole("radio", {
        name: /Wednesday, March 10.*9:00 AM/i,
      });

      await user.click(jeepTourSession);

      const updatedActivities = activitiesByTrip[1].map((activity) => ({
        ...activity,
        sessions: activity.sessions.map((session) =>
          activity.id === "2" && session.id === 201
            ? {
                ...session,
                reservedCount: session.maxCapacity,
              }
            : session,
        ),
      }));

      globalThis.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => updatedActivities,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [registration],
        });

      await user.click(
        screen.getByRole("button", {
          name: "Save",
        }),
      );

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();

        expect(
          screen.getByRole("button", {
            name: "Save",
          }),
        ).toBeEnabled();

        expect(
          screen.getByRole("button", {
            name: "Cancel",
          }),
        ).toBeEnabled();

        expect(jeepTourCheckbox).toBeEnabled();
        expect(jeepTourSession).toBeDisabled();

        expect(store.getState().activities.byTrip[1]).toEqual(
          updatedActivities,
        );

        expect(store.getState().registrations.byTrip[1][0]).toEqual(
          registration,
        );

        expect(globalThis.fetch).toHaveBeenLastCalledWith(
          "http://localhost:8080/api/trips/1/registrations",
        );
      });

      const mutationCalls = globalThis.fetch.mock.calls.filter(
        ([, options]) =>
          options?.method === "PUT" || options?.method === "DELETE",
      );

      expect(mutationCalls).toEqual([
        [
          "http://localhost:8080/api/trips/1/registrations/1047/guest/activities/2/sessions/201",
          { method: "PUT" },
        ],
      ]);
    } finally {
      alertSpy.mockRestore();
    }
  });

  test("navigates back to the traveler details page", async () => {
    const user = userEvent.setup();

    renderGuestDetails();

    await user.click(
      screen.getByRole("button", {
        name: "Back to Traveler",
      }),
    );

    expect(screen.getByText("Traveler Details Page")).toBeInTheDocument();
  });
});
