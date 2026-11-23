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
      name: /Mar 10, 2027.*9:00 AM.*Full/i,
    });

    screen.debug();

    expect(fullSession).toBeDisabled();
  });

  test("saves guest activity selections through the backend API", async () => {
    const user = userEvent.setup();

    const store = renderGuestDetails();

    globalThis.fetch.mockImplementation((url, options) => {
      if (options?.method === "PUT") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ...registrationsByTrip[1].find(
              (registration) => registration.travelerNumber === 1047,
            ),
            guest: {
              ...registrationsByTrip[1].find(
                (registration) => registration.travelerNumber === 1047,
              ).guest,
              activities: [
                {
                  id: "2",
                  type: "Excursion",
                  name: "Island Jeep Tour",
                  sessionId: 201,
                },
              ],
            },
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () =>
          url.endsWith("/activities")
            ? (activitiesByTrip[1] ?? [])
            : registrationsByTrip[1],
      });
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
      name: /Mar 10, 2027.*9:00 AM/i,
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
      const updatedRegistration = store
        .getState()
        .registrations.byTrip[1].find(
          (registration) => registration.travelerNumber === 1047,
        );

      expect(updatedRegistration.guest.activities).toEqual([
        {
          id: "2",
          type: "Excursion",
          name: "Island Jeep Tour",
          sessionId: 201,
        },
      ]);
    });
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
