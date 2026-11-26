import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import RegistrationDetails from "../../pages/RegistrationDetails";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import registrationsReducer from "../../store/registrationsSlice";
import activitiesReducer from "../../store/activitiesSlice";

const registration = {
  travelerNumber: 1047,
  firstName: "Robert",
  lastName: "Henderson",
  email: "robert@example.com",
  phone: "216-555-0142",
  dateOfBirth: "June 14, 1987",
  address: {
    street: "123 Main Street",
    city: "Cleveland",
    state: "OH",
    zipCode: "44113",
  },
  airport: "CLE",
  tsaPrecheck: true,
  passportNumber: "123456789",
  passportExpiration: "August 12, 2030",
  sex: "Male",
  bringingGuest: true,
  guest: {
    firstName: "Amanda",
    lastName: "Henderson",
    email: "amanda@example.com",
  },
  emergencyContact: {
    name: "Robert Henderson",
    relationship: "Father",
    phone: "216-555-0198",
  },
  accessibility: "None",
  dietaryRequirements: "Vegetarian",
  activities: [
    {
      activityId: 1,
      type: "Excursion",
      name: "Catamaran & Snorkeling",
      sessionId: 101,
    },
    {
      activityId: 4,
      type: "Spa",
      name: "Massage Appointment",
      sessionId: 401,
    },
  ],
};

const activities = [
  {
    id: 1,
    type: "Excursion",
    name: "Catamaran & Snorkeling",
    sessions: [
      {
        id: 101,
        date: "2027-03-09",
        time: "10:00:00",
        maxCapacity: 25,
        reservedCount: 1,
        active: true,
      },
      {
        id: 102,
        date: "2027-03-09",
        time: "14:00:00",
        maxCapacity: 25,
        reservedCount: 0,
        active: true,
      },
    ],
  },
  {
    id: 2,
    type: "Excursion",
    name: "Island Jeep Tour",
    sessions: [
      {
        id: 201,
        date: "2027-03-10",
        time: "09:00:00",
        maxCapacity: 12,
        reservedCount: 0,
        active: true,
      },
    ],
  },
  {
    id: 3,
    type: "Dining",
    name: "Sunset Dinner",
    sessions: [
      {
        id: 301,
        date: "2027-03-11",
        time: "18:30:00",
        maxCapacity: 20,
        reservedCount: 0,
        active: false,
      },
    ],
  },
  {
    id: 4,
    type: "Spa",
    name: "Massage Appointment",
    sessions: [
      {
        id: 401,
        date: "2027-03-12",
        time: "11:00:00",
        maxCapacity: 10,
        reservedCount: 1,
        active: true,
      },
    ],
  },
];

const registrationsByTrip = {
  1: [registration],
};

const renderRegistrationDetails = (
  testRegistrationsByTrip = registrationsByTrip,
  testActivities = activities,
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
        byTrip: {
          1: testActivities,
        },
        status: "idle",
        error: null,
      },
    },
  });

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      if (url === "http://localhost:8080/api/trips/1/activities") {
        return {
          ok: true,
          json: async () => testActivities,
        };
      }

      if (url === "http://localhost:8080/api/trips/1/registrations") {
        return {
          ok: true,
          json: async () => testRegistrationsByTrip[1] || [],
        };
      }

      throw new Error(`Unexpected API request: ${url}`);
    }),
  );

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/trips/1/registrations/1047"]}>
        <Routes>
          <Route
            path="/trips/:tripId/registrations/:id"
            element={<RegistrationDetails />}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return store;
};
describe("RegistrationDetails", () => {
  test("displays the correct traveler from the URL", () => {
    renderRegistrationDetails();

    expect(screen.getByText("Traveler #1047")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Robert Henderson",
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByText("robert@example.com")).toHaveLength(2);
  });
  test("allows personal information to be edited and saved", async () => {
    const user = userEvent.setup();

    renderRegistrationDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[0]);

    const firstNameInput = screen.getByDisplayValue("Robert");
    const emailInput = screen.getByDisplayValue("robert@example.com");

    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Bob");

    await user.clear(emailInput);
    await user.type(emailInput, "bob@example.com");

    const updatedRegistration = {
      ...registration,
      firstName: "Bob",
      email: "bob@example.com",
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedRegistration,
    });

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "http://localhost:8080/api/trips/1/registrations/1047",
      expect.objectContaining({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const request = globalThis.fetch.mock.calls.at(-1)[1];
    const requestBody = JSON.parse(request.body);

    expect(requestBody.firstName).toBe("Bob");
    expect(requestBody.email).toBe("bob@example.com");
    expect(requestBody.lastName).toBe("Henderson");
    expect(requestBody.travelerNumber).toBe(1047);
  });
  test("cancels personal information changes without saving them", async () => {
    const user = userEvent.setup();

    renderRegistrationDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[0]);

    const firstNameInput = screen.getByDisplayValue("Robert");

    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Bob");

    expect(screen.getByDisplayValue("Bob")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/trips/1/registrations",
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/trips/1/activities",
    );

    expect(screen.queryByDisplayValue("Bob")).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Robert Henderson",
      }),
    ).toBeInTheDocument();
  });
  test("converts the departure airport to uppercase while editing", async () => {
    const user = userEvent.setup();

    renderRegistrationDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[1]);

    const airportInput = screen.getByDisplayValue("CLE");

    await user.clear(airportInput);
    await user.type(airportInput, "lax");

    expect(airportInput).toHaveValue("LAX");
  });
  test("toggles TSA PreCheck and saves the updated travel information", async () => {
    const user = userEvent.setup();

    renderRegistrationDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[1]);

    const yesButtons = screen.getAllByRole("button", {
      name: "Yes",
    });

    const tsaButton = yesButtons[0];

    await user.click(tsaButton);

    expect(
      screen.getByRole("button", {
        name: "No",
      }),
    ).toBeInTheDocument();

    const updatedRegistration = {
      ...registration,
      tsaPrecheck: false,
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedRegistration,
    });

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "http://localhost:8080/api/trips/1/registrations/1047",
      expect.objectContaining({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const request = globalThis.fetch.mock.calls.at(-1)[1];
    const requestBody = JSON.parse(request.body);

    expect(requestBody.airport).toBe("CLE");
    expect(requestBody.tsaPrecheck).toBe(false);
    expect(requestBody.travelerNumber).toBe(1047);

    expect(requestBody).not.toHaveProperty("departureAirport");
    expect(requestBody).not.toHaveProperty("passportIssuingCountry");
    expect(requestBody).not.toHaveProperty("nationality");
    expect(requestBody).not.toHaveProperty("citizenship");
  });
  test("keeps the guest when guest removal is cancelled", async () => {
    const user = userEvent.setup();

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    renderRegistrationDetails();

    expect(screen.getByText("Amanda Henderson")).toBeInTheDocument();
    expect(screen.getByText("amanda@example.com")).toBeInTheDocument();

    const yesButtons = screen.getAllByRole("button", {
      name: "Yes",
    });

    const guestToggle = yesButtons[0];

    await user.click(guestToggle);

    expect(confirmSpy).toHaveBeenCalledTimes(1);

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/trips/1/registrations",
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/trips/1/activities",
    );

    expect(screen.getByText("Amanda Henderson")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
  test("removes the guest when guest removal is confirmed", async () => {
    const user = userEvent.setup();

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderRegistrationDetails();

    const updatedRegistration = {
      ...registration,
      bringingGuest: false,
      guest: null,
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedRegistration,
    });

    const guestToggle = screen.getByRole("button", {
      name: "Yes",
    });

    await user.click(guestToggle);

    expect(confirmSpy).toHaveBeenCalledTimes(1);

    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "http://localhost:8080/api/trips/1/registrations/1047",
      expect.objectContaining({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const request = globalThis.fetch.mock.calls.at(-1)[1];
    const requestBody = JSON.parse(request.body);

    expect(requestBody.bringingGuest).toBe(false);
    expect(requestBody.guest).toBeNull();
    expect(requestBody.travelerNumber).toBe(1047);

    confirmSpy.mockRestore();
  });
  test("adds a blank guest when the traveler is not bringing a guest", async () => {
    const user = userEvent.setup();

    const registrationWithoutGuest = {
      ...registration,
      bringingGuest: false,
      guest: null,
    };

    const testRegistrationsByTrip = {
      1: [registrationWithoutGuest],
    };

    renderRegistrationDetails(testRegistrationsByTrip);

    const blankGuest = {
      firstName: "",
      preferredName: "",
      lastName: "",
      sex: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      passportNumber: "",
      passportExpiration: "",
      accessibility: "",
      dietaryRequirements: "",
    };

    const updatedRegistration = {
      ...registrationWithoutGuest,
      bringingGuest: true,
      guest: blankGuest,
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedRegistration,
    });

    const guestToggle = screen.getByRole("button", {
      name: "No",
    });

    await user.click(guestToggle);

    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "http://localhost:8080/api/trips/1/registrations/1047",
      expect.objectContaining({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const request = globalThis.fetch.mock.calls.at(-1)[1];
    const requestBody = JSON.parse(request.body);

    expect(requestBody.bringingGuest).toBe(true);
    expect(requestBody.guest).toEqual(blankGuest);
    expect(requestBody.travelerNumber).toBe(1047);
  });
  test("does not save a trip selection without a session", async () => {
    const user = userEvent.setup();

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderRegistrationDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[5]);

    const jeepTourCheckbox = screen.getByRole("checkbox", {
      name: /Island Jeep Tour/i,
    });

    await user.click(jeepTourCheckbox);

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Please select a session for each trip selection.",
    );

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/trips/1/registrations",
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/trips/1/activities",
    );

    alertSpy.mockRestore();
  });
  test("adds a trip selection with its selected session", async () => {
    const user = userEvent.setup();

    const store = renderRegistrationDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[5]);

    const jeepTourCheckbox = screen.getByRole("checkbox", {
      name: /Island Jeep Tour/i,
    });

    await user.click(jeepTourCheckbox);

    const jeepTourSession = screen.getByRole("radio", {
      name: /Wednesday, March 10.*9:00 AM/i,
    });

    await user.click(jeepTourSession);

    const jeepTour = {
      activityId: 2,
      type: "Excursion",
      name: "Island Jeep Tour",
      sessionId: 201,
    };

    const updatedRegistration = {
      ...registration,
      activities: [...registration.activities, jeepTour],
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedRegistration,
    });

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => activities,
    });

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [updatedRegistration],
    });

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/trips/1/registrations/1047/activities/2/sessions/201",
      {
        method: "PUT",
      },
    );

    expect(
      store.getState().registrations.byTrip[1][0].activities,
    ).toContainEqual(jeepTour);

    expect(screen.getByText("Island Jeep Tour")).toBeInTheDocument();
  });
  test("disables an unavailable trip selection session", async () => {
    const user = userEvent.setup();

    renderRegistrationDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[5]);

    const unavailableSession = screen.getByRole("radio", {
      name: /Thursday, March 11.*6:30 PM.*Unavailable/i,
    });

    expect(unavailableSession).toBeDisabled();
  });
  test("disables a trip selection session when it is full", async () => {
    const user = userEvent.setup();

    const fullSessionActivities = activities.map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) =>
        activity.id === 2 && session.id === 201
          ? {
              ...session,
              reservedCount: session.maxCapacity,
            }
          : session,
      ),
    }));

    renderRegistrationDetails(registrationsByTrip, fullSessionActivities);

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[5]);

    const fullSession = screen.getByRole("radio", {
      name: /Wednesday, March 10.*9:00 AM.*Full/i,
    });

    expect(fullSession).toBeDisabled();
  });
  test("allows the traveler to keep their current session when it is full", async () => {
    const user = userEvent.setup();

    const fullSessionActivities = activities.map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) =>
        activity.id === 1 && session.id === 101
          ? {
              ...session,
              reservedCount: session.maxCapacity,
            }
          : session,
      ),
    }));

    renderRegistrationDetails(registrationsByTrip, fullSessionActivities);
    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[5]);

    const currentSession = screen.getByRole("radio", {
      name: /Tuesday, March 9.*10:00 AM/i,
    });

    expect(currentSession).toBeChecked();
    expect(currentSession).not.toBeDisabled();
  });
  test("allows the traveler to switch from their current full session", async () => {
    const user = userEvent.setup();

    const fullSessionActivities = activities.map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) =>
        activity.id === 1 && session.id === 101
          ? {
              ...session,
              reservedCount: session.maxCapacity,
            }
          : session,
      ),
    }));

    const store = renderRegistrationDetails(
      registrationsByTrip,
      fullSessionActivities,
    );

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[5]);

    const afternoonSession = screen.getByRole("radio", {
      name: /Tuesday, March 9.*2:00 PM/i,
    });

    await user.click(afternoonSession);

    expect(afternoonSession).toBeChecked();
    const canceledRegistration = {
      ...registration,
      activities: registration.activities.filter(
        (activity) => activity.activityId !== 1,
      ),
    };

    const updatedRegistration = {
      ...registration,
      activities: registration.activities.map((activity) =>
        activity.activityId === 1
          ? {
              ...activity,
              sessionId: 102,
            }
          : activity,
      ),
    };

    const updatedActivities = fullSessionActivities.map((activity) => ({
      ...activity,
      sessions: activity.sessions.map((session) => {
        if (activity.id === 1 && session.id === 101) {
          return {
            ...session,
            reservedCount: session.reservedCount - 1,
          };
        }

        if (activity.id === 1 && session.id === 102) {
          return {
            ...session,
            reservedCount: session.reservedCount + 1,
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
        "http://localhost:8080/api/trips/1/registrations/1047/activities/1/sessions/101",
        { method: "DELETE" },
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/trips/1/registrations/1047/activities/1/sessions/102",
        { method: "PUT" },
      );

      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        "http://localhost:8080/api/trips/1/registrations",
      );

      const savedRegistration = store
        .getState()
        .registrations.byTrip[1].find((item) => item.travelerNumber === 1047);

      expect(savedRegistration.activities).toEqual(
        updatedRegistration.activities,
      );

      expect(savedRegistration.guest).toEqual(registration.guest);

      expect(store.getState().activities.byTrip[1]).toEqual(updatedActivities);
    });
  });
  test("removes an existing trip selection", async () => {
    const user = userEvent.setup();

    const store = renderRegistrationDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[5]);

    const catamaranCheckbox = screen.getByRole("checkbox", {
      name: /Catamaran & Snorkeling/i,
    });

    expect(catamaranCheckbox).toBeChecked();

    const updatedRegistration = {
      ...registration,
      activities: registration.activities.filter(
        (activity) => activity.activityId !== 1,
      ),
    };

    await user.click(catamaranCheckbox);

    expect(catamaranCheckbox).not.toBeChecked();

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedRegistration,
    });

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => activities,
    });

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [updatedRegistration],
    });

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/trips/1/registrations/1047/activities/1/sessions/101",
      {
        method: "DELETE",
      },
    );

    const savedRegistration = store.getState().registrations.byTrip[1][0];

    expect(savedRegistration.activities).not.toContainEqual(
      expect.objectContaining({
        activityId: 1,
      }),
    );

    expect(savedRegistration.activities).toContainEqual({
      activityId: 4,
      type: "Spa",
      name: "Massage Appointment",
      sessionId: 401,
    });

    expect(savedRegistration.guest).toEqual(registration.guest);

    expect(
      screen.queryByText("Catamaran & Snorkeling"),
    ).not.toBeInTheDocument();

    expect(screen.getByText("Massage Appointment")).toBeInTheDocument();
  });
  test("allows emergency contact information to be edited and saved", async () => {
    const user = userEvent.setup();

    renderRegistrationDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[2]);

    const nameInput = screen.getByDisplayValue("Robert Henderson");
    const relationshipInput = screen.getByDisplayValue("Father");
    const phoneInput = screen.getByDisplayValue("216-555-0198");

    await user.clear(nameInput);
    await user.type(nameInput, "Susan Henderson");

    await user.clear(relationshipInput);
    await user.type(relationshipInput, "Mother");

    await user.clear(phoneInput);
    await user.type(phoneInput, "216-555-9999");

    const updatedRegistration = {
      ...registration,
      emergencyContact: {
        name: "Susan Henderson",
        relationship: "Mother",
        phone: "216-555-9999",
      },
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedRegistration,
    });

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "http://localhost:8080/api/trips/1/registrations/1047",
      expect.objectContaining({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const request = globalThis.fetch.mock.calls.at(-1)[1];
    const requestBody = JSON.parse(request.body);

    expect(requestBody.emergencyContact).toEqual({
      name: "Susan Henderson",
      relationship: "Mother",
      phone: "216-555-9999",
    });

    expect(requestBody.travelerNumber).toBe(1047);
  });
  test("allows address information to be edited and saved", async () => {
    const user = userEvent.setup();

    renderRegistrationDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[3]);

    const streetInput = screen.getByDisplayValue("123 Main Street");
    const cityInput = screen.getByDisplayValue("Cleveland");
    const stateInput = screen.getByDisplayValue("OH");
    const zipInput = screen.getByDisplayValue("44113");

    await user.clear(streetInput);
    await user.type(streetInput, "456 Euclid Avenue");

    await user.clear(cityInput);
    await user.type(cityInput, "Cleveland");

    await user.clear(stateInput);
    await user.type(stateInput, "OH");

    await user.clear(zipInput);
    await user.type(zipInput, "44114");

    const updatedRegistration = {
      ...registration,
      address: {
        street: "456 Euclid Avenue",
        city: "Cleveland",
        state: "OH",
        zipCode: "44114",
      },
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedRegistration,
    });

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "http://localhost:8080/api/trips/1/registrations/1047",
      expect.objectContaining({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const request = globalThis.fetch.mock.calls.at(-1)[1];
    const requestBody = JSON.parse(request.body);

    expect(requestBody.address).toEqual({
      street: "456 Euclid Avenue",
      city: "Cleveland",
      state: "OH",
      zipCode: "44114",
    });

    expect(requestBody.travelerNumber).toBe(1047);
  });
  test("allows special requirements to be edited and saved", async () => {
    const user = userEvent.setup();

    renderRegistrationDetails();

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[4]);

    const accessibilityInput = screen.getByDisplayValue("None");
    const dietaryInput = screen.getByDisplayValue("Vegetarian");

    await user.clear(accessibilityInput);
    await user.type(accessibilityInput, "Wheelchair accessible transportation");

    await user.clear(dietaryInput);
    await user.type(dietaryInput, "Gluten-free");

    const updatedRegistration = {
      ...registration,
      accessibility: "Wheelchair accessible transportation",
      dietaryRequirements: "Gluten-free",
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedRegistration,
    });

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "http://localhost:8080/api/trips/1/registrations/1047",
      expect.objectContaining({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const request = globalThis.fetch.mock.calls.at(-1)[1];
    const requestBody = JSON.parse(request.body);

    expect(requestBody.accessibility).toBe(
      "Wheelchair accessible transportation",
    );
    expect(requestBody.dietaryRequirements).toBe("Gluten-free");
    expect(requestBody.travelerNumber).toBe(1047);
  });
});
