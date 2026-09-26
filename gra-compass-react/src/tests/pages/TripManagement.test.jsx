import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import TripManagement from "../../pages/TripManagement";

const trip = {
  id: 1,
  name: "Cancun Incentive Trip",
  destination: "Cancun, Mexico",
  startDate: "2027-03-08",
  endDate: "2027-03-14",
  registrationCloseDate: "2027-02-15",
  registrationCapacity: 100,
  travelerCapacity: 150,
  registrationsPaused: false,
  imagePreview: "",
};

const registrationsByTrip = {
  1: [],
};

const renderTripManagement = ({
  testTrips = [trip],
  testRegistrationsByTrip = registrationsByTrip,
  initialEntry = "/trips/1/manage",
} = {}) => {
  const setTrips = vi.fn();

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/trips/:tripId/manage"
          element={
            <TripManagement
              trips={testTrips}
              setTrips={setTrips}
              registrationsByTrip={testRegistrationsByTrip}
            />
          }
        />
      </Routes>
    </MemoryRouter>,
  );

  return { setTrips };
};

describe("TripManagement", () => {
  test("displays the trip summary", () => {
    renderTripManagement();

    expect(
      screen.getByRole("heading", {
        name: "Cancun Incentive Trip",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Cancun, Mexico")).toBeInTheDocument();

    expect(
      screen.getByText(/March 8, 2027.*March 14, 2027/),
    ).toBeInTheDocument();
  });
  test("opens the registrations tab from the URL query parameter", () => {
    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=registrations",
    });

    expect(
      screen.getByRole("heading", {
        name: "Registrations",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Registrations",
      }),
    ).toHaveClass("active");

    expect(
      screen.queryByText("Available Trip Selections"),
    ).not.toBeInTheDocument();
  });
  test("opens the trip selections tab from the URL query parameter", () => {
    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    expect(
      screen.getByRole("heading", {
        name: "Available Trip Selections",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Trip Selections",
      }),
    ).toHaveClass("active");

    expect(
      screen.queryByRole("heading", {
        name: "Registrations",
      }),
    ).not.toBeInTheDocument();
  });
  test("edits and saves the trip name", async () => {
    const user = userEvent.setup();

    const { setTrips } = renderTripManagement();

    await user.click(
      screen.getByRole("button", {
        name: "Edit Trip",
      }),
    );

    const tripNameInput = screen.getByLabelText("Trip Name");

    await user.clear(tripNameInput);
    await user.type(tripNameInput, "  Cancun Adventure  ");

    const saveButtons = screen.getAllByRole("button", {
      name: "Save",
    });

    await user.click(saveButtons[0]);

    expect(setTrips).toHaveBeenCalledTimes(1);

    const updateTrips = setTrips.mock.calls[0][0];
    const updatedTrips = updateTrips([trip]);

    expect(updatedTrips[0].name).toBe("Cancun Adventure");
    expect(updatedTrips[0].destination).toBe("Cancun, Mexico");
    expect(updatedTrips[0].id).toBe(1);
  });
  test("does not save an empty trip name", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const { setTrips } = renderTripManagement();

    await user.click(
      screen.getByRole("button", {
        name: "Edit Trip",
      }),
    );

    const tripNameInput = screen.getByLabelText("Trip Name");

    await user.clear(tripNameInput);

    const saveButtons = screen.getAllByRole("button", {
      name: "Save",
    });

    await user.click(saveButtons[0]);

    expect(alertSpy).toHaveBeenCalledWith("Trip name is required.");
    expect(setTrips).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
  test("does not save an end date before the start date", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const { setTrips } = renderTripManagement();

    await user.click(
      screen.getByRole("button", {
        name: "Edit Trip",
      }),
    );

    const endDateInput = screen.getByLabelText("End Date");

    await user.clear(endDateInput);
    await user.type(endDateInput, "2027-03-01");

    const endDateSection = endDateInput.closest(".trip-details-edit");
    const saveButton = endDateSection.querySelector("button");

    await user.click(saveButton);

    expect(alertSpy).toHaveBeenCalledWith(
      "End date cannot be before the start date.",
    );

    expect(setTrips).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
  test("does not allow registration capacity below existing registrations", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const testRegistrationsByTrip = {
      1: [
        {
          travelerNumber: 1001,
          firstName: "Robert",
          lastName: "Henderson",
        },
        {
          travelerNumber: 1002,
          firstName: "Amanda",
          lastName: "Henderson",
        },
        {
          travelerNumber: 1003,
          firstName: "Snow",
          lastName: "White",
        },
      ],
    };

    const { setTrips } = renderTripManagement({
      testRegistrationsByTrip,
    });

    await user.click(
      screen.getByRole("button", {
        name: "Edit Settings",
      }),
    );

    const registrationCapacityInput = screen.getByLabelText(
      "Registration Capacity",
    );

    await user.clear(registrationCapacityInput);
    await user.type(registrationCapacityInput, "2");

    await user.click(
      screen.getByRole("button", {
        name: "Save Settings",
      }),
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Registration capacity cannot be lower than the 3 existing registrations.",
    );

    expect(setTrips).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
  test("does not allow traveler capacity below existing travelers including guests", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const testRegistrationsByTrip = {
      1: [
        {
          travelerNumber: 1001,
          firstName: "Robert",
          lastName: "Henderson",
          bringingGuest: true,
          guest: {
            firstName: "Amanda",
            lastName: "Henderson",
          },
        },
        {
          travelerNumber: 1002,
          firstName: "Snow",
          lastName: "White",
          bringingGuest: false,
        },
      ],
    };

    const { setTrips } = renderTripManagement({
      testRegistrationsByTrip,
    });

    await user.click(
      screen.getByRole("button", {
        name: "Edit Settings",
      }),
    );

    const registrationCapacityInput = screen.getByLabelText(
      "Registration Capacity",
    );

    await user.clear(registrationCapacityInput);
    await user.type(registrationCapacityInput, "2");

    const travelerCapacityInput = screen.getByLabelText("Traveler Capacity");

    await user.clear(travelerCapacityInput);
    await user.type(travelerCapacityInput, "2");

    await user.click(
      screen.getByRole("button", {
        name: "Save Settings",
      }),
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Traveler capacity cannot be lower than the 3 existing travelers.",
    );

    expect(setTrips).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
  test("saves valid registration settings", async () => {
    const user = userEvent.setup();

    const { setTrips } = renderTripManagement();

    await user.click(
      screen.getByRole("button", {
        name: "Edit Settings",
      }),
    );

    const registrationCapacityInput = screen.getByLabelText(
      "Registration Capacity",
    );
    const travelerCapacityInput = screen.getByLabelText("Traveler Capacity");
    const closeDateInput = screen.getByLabelText("Registration Close Date");

    await user.clear(registrationCapacityInput);
    await user.type(registrationCapacityInput, "75");

    await user.clear(travelerCapacityInput);
    await user.type(travelerCapacityInput, "125");

    await user.clear(closeDateInput);
    await user.type(closeDateInput, "2027-02-20");

    await user.click(
      screen.getByRole("button", {
        name: "Save Settings",
      }),
    );

    expect(setTrips).toHaveBeenCalledTimes(1);

    const updateTrips = setTrips.mock.calls[0][0];
    const updatedTrips = updateTrips([trip]);

    expect(updatedTrips[0].registrationCapacity).toBe(75);
    expect(updatedTrips[0].travelerCapacity).toBe(125);
    expect(updatedTrips[0].registrationCloseDate).toBe("2027-02-20");

    expect(
      screen.getByRole("heading", {
        name: "Registration Summary",
      }),
    ).toBeInTheDocument();
  });
  test("pauses registrations", async () => {
    const user = userEvent.setup();

    const { setTrips } = renderTripManagement();

    await user.click(
      screen.getByRole("button", {
        name: "Edit Settings",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Pause Registrations",
      }),
    );

    expect(setTrips).toHaveBeenCalledTimes(1);

    const updateTrips = setTrips.mock.calls[0][0];
    const updatedTrips = updateTrips([trip]);

    expect(updatedTrips[0].registrationsPaused).toBe(true);
    expect(updatedTrips[0].name).toBe("Cancun Incentive Trip");
  });
  test("resumes paused registrations", async () => {
    const user = userEvent.setup();

    const pausedTrip = {
      ...trip,
      registrationsPaused: true,
    };

    const { setTrips } = renderTripManagement({
      testTrips: [pausedTrip],
    });

    await user.click(
      screen.getByRole("button", {
        name: "Edit Settings",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Resume Registrations",
      }),
    );

    expect(setTrips).toHaveBeenCalledTimes(1);

    const updateTrips = setTrips.mock.calls[0][0];
    const updatedTrips = updateTrips([pausedTrip]);

    expect(updatedTrips[0].registrationsPaused).toBe(false);
  });
  test("requires selection details before adding a trip selection", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Add Selection",
      }),
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Selection type, name, session date, and session time are required.",
    );

    alertSpy.mockRestore();
  });
  test("adds a new trip selection with its first session", async () => {
    const user = userEvent.setup();

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const typeInput = screen.getByPlaceholderText("Selection type");
    const nameInput = screen.getByPlaceholderText("Selection name");
    const capacityInput = screen.getByPlaceholderText("Max capacity");

    const dateInput = document.querySelector(
      '.add-selection-form input[type="date"]',
    );
    const timeInput = document.querySelector(
      '.add-selection-form input[type="time"]',
    );

    await user.type(typeInput, "Excursion");
    await user.type(nameInput, "Pirate Ship Adventure");
    await user.type(dateInput, "2027-03-11");
    await user.type(timeInput, "14:30");
    await user.type(capacityInput, "20");

    await user.click(
      screen.getByRole("button", {
        name: "Add Selection",
      }),
    );

    expect(screen.getByText("Pirate Ship Adventure")).toBeInTheDocument();

    expect(typeInput).toHaveValue("");
    expect(nameInput).toHaveValue("");
    expect(dateInput).toHaveValue("");
    expect(timeInput).toHaveValue("");
    expect(capacityInput).toHaveValue(null);
  });
  test("does not delete a session that already has registrations", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockImplementation(() => true);

    const testRegistrationsByTrip = {
      1: [
        {
          travelerNumber: 1047,
          firstName: "Robert",
          lastName: "Henderson",
          activities: [
            {
              id: 1,
              type: "Excursion",
              name: "Catamaran & Snorkeling",
              sessionId: 101,
            },
          ],
        },
      ],
    };

    renderTripManagement({
      testRegistrationsByTrip,
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const deleteButtons = screen.getAllByRole("button", {
      name: "Delete Session",
    });

    await user.click(deleteButtons[0]);

    expect(alertSpy).toHaveBeenCalledWith(
      "This session cannot be deleted because 1 people are already registered for it.",
    );

    expect(confirmSpy).not.toHaveBeenCalled();

    alertSpy.mockRestore();
    confirmSpy.mockRestore();
  });
  test("keeps a session when deletion is canceled", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockImplementation(() => false);

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const deleteButtons = screen.getAllByRole("button", {
      name: "Delete Session",
    });

    await user.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith(
      "Are you sure you want to delete this session?",
    );

    expect(screen.getByText("2027-03-09 — 10:00")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
  test("deletes an unregistered session when deletion is confirmed", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockImplementation(() => true);

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const deleteButtons = screen.getAllByRole("button", {
      name: "Delete Session",
    });

    await user.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith(
      "Are you sure you want to delete this session?",
    );

    expect(screen.queryByText("2027-03-09 — 10:00")).not.toBeInTheDocument();

    expect(screen.getByText("2027-03-09 — 14:00")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
  test("does not lower session capacity below existing registrations", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const testRegistrationsByTrip = {
      1: [
        {
          travelerNumber: 1047,
          firstName: "Robert",
          activities: [
            {
              id: 1,
              type: "Excursion",
              name: "Catamaran & Snorkeling",
              sessionId: 101,
            },
          ],
        },
        {
          travelerNumber: 1048,
          firstName: "Amanda",
          activities: [
            {
              id: 1,
              type: "Excursion",
              name: "Catamaran & Snorkeling",
              sessionId: 101,
            },
          ],
        },
      ],
    };

    renderTripManagement({
      testRegistrationsByTrip,
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const editSessionButtons = screen.getAllByRole("button", {
      name: "Edit Session",
    });

    await user.click(editSessionButtons[0]);

    const capacityInputs = screen.getAllByPlaceholderText("Max capacity");
    const capacityInput = capacityInputs[0];

    await user.clear(capacityInput);
    await user.type(capacityInput, "1");

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Capacity cannot be lower than the 2 people already registered.",
    );

    expect(capacityInput).toBeInTheDocument();

    alertSpy.mockRestore();
  });
  test("saves valid changes to a session", async () => {
    const user = userEvent.setup();

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const editSessionButtons = screen.getAllByRole("button", {
      name: "Edit Session",
    });

    await user.click(editSessionButtons[0]);

    const capacityInputs = screen.getAllByPlaceholderText("Max capacity");
    const capacityInput = capacityInputs[0];

    await user.clear(capacityInput);
    await user.type(capacityInput, "30");

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    const capacityDisplays = screen.getAllByText("Capacity:");

    expect(capacityDisplays[0].parentElement).toHaveTextContent("Capacity: 30");

    expect(
      screen.queryByRole("button", {
        name: "Save",
      }),
    ).not.toBeInTheDocument();
  });
  test("deactivates an active session", async () => {
    const user = userEvent.setup();

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const deactivateButtons = screen.getAllByRole("button", {
      name: "Deactivate",
    });

    await user.click(deactivateButtons[0]);

    expect(screen.getAllByText("Inactive").length).toBeGreaterThan(0);

    expect(
      screen.getAllByRole("button", {
        name: "Activate",
      }).length,
    ).toBeGreaterThan(0);
  });
  test("activates an inactive session", async () => {
    const user = userEvent.setup();

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const activateButton = screen.getByRole("button", {
      name: "Activate",
    });

    await user.click(activateButton);

    expect(
      screen.queryByRole("button", {
        name: "Activate",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getAllByRole("button", {
        name: "Deactivate",
      }).length,
    ).toBeGreaterThan(0);
  });
  test("requires a date and time when adding a session", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const addSessionButtons = screen.getAllByRole("button", {
      name: "Add Session",
    });

    await user.click(addSessionButtons[0]);

    const visibleAddSessionButtons = screen.getAllByRole("button", {
      name: "Add Session",
    });

    await user.click(visibleAddSessionButtons[1]);

    expect(alertSpy).toHaveBeenCalledWith(
      "Session date and time are required.",
    );

    alertSpy.mockRestore();
  });
  test("adds a new session to an existing selection", async () => {
    const user = userEvent.setup();

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const addSessionButtons = screen.getAllByRole("button", {
      name: "Add Session",
    });

    await user.click(addSessionButtons[0]);

    const dateInput = document.querySelector(
      '.add-session-form input[type="date"]',
    );
    const timeInput = document.querySelector(
      '.add-session-form input[type="time"]',
    );

    const capacityInputs = screen.getAllByPlaceholderText("Max capacity");
    const capacityInput = capacityInputs[0];

    await user.type(dateInput, "2027-03-10");
    await user.type(timeInput, "16:30");
    await user.type(capacityInput, "35");

    const updatedAddSessionButtons = screen.getAllByRole("button", {
      name: "Add Session",
    });

    await user.click(updatedAddSessionButtons[1]);

    expect(
      screen.getByRole("option", {
        name: "2027-03-10 — 16:30",
      }),
    ).toBeInTheDocument();

    const capacityDisplays = screen.getAllByText("Capacity:");

    expect(capacityDisplays[0].parentElement).toHaveTextContent("Capacity: 35");
  });
  test("does not add a session with capacity below one", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const addSessionButtons = screen.getAllByRole("button", {
      name: "Add Session",
    });

    await user.click(addSessionButtons[0]);

    const dateInput = document.querySelector(
      '.add-session-form input[type="date"]',
    );
    const timeInput = document.querySelector(
      '.add-session-form input[type="time"]',
    );

    const capacityInputs = screen.getAllByPlaceholderText("Max capacity");
    const capacityInput = capacityInputs[0];

    await user.type(dateInput, "2027-03-10");
    await user.type(timeInput, "16:30");
    await user.type(capacityInput, "0");

    const updatedAddSessionButtons = screen.getAllByRole("button", {
      name: "Add Session",
    });

    await user.click(updatedAddSessionButtons[1]);

    expect(alertSpy).toHaveBeenCalledWith("Max capacity must be at least 1.");

    expect(
      screen.queryByRole("option", {
        name: "2027-03-10 — 16:30",
      }),
    ).not.toBeInTheDocument();

    alertSpy.mockRestore();
  });
  test("edits an existing trip selection", async () => {
    const user = userEvent.setup();

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const editExcursionButtons = screen.getAllByRole("button", {
      name: "Edit Excursion",
    });

    await user.click(editExcursionButtons[0]);

    const nameInput = screen.getByDisplayValue("Catamaran & Snorkeling");

    await user.clear(nameInput);
    await user.type(nameInput, "Catamaran Adventure");

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(screen.getByText("Catamaran Adventure")).toBeInTheDocument();

    expect(
      screen.queryByText("Catamaran & Snorkeling"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "2027-03-09 — 10:00",
      }),
    ).toBeInTheDocument();
  });
  test("cancels changes to an existing trip selection", async () => {
    const user = userEvent.setup();

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const selectionName = screen.getByText("Catamaran & Snorkeling");
    const selectionCard = selectionName.closest(".selection-card");

    await user.click(
      within(selectionCard).getByRole("button", {
        name: "Edit Excursion",
      }),
    );

    const nameInput = within(selectionCard).getByDisplayValue(
      "Catamaran & Snorkeling",
    );

    await user.clear(nameInput);
    await user.type(nameInput, "Definitely Not A Catamaran");

    await user.click(
      within(selectionCard).getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(
      within(selectionCard).getByText("Catamaran & Snorkeling"),
    ).toBeInTheDocument();

    expect(
      within(selectionCard).queryByText("Definitely Not A Catamaran"),
    ).not.toBeInTheDocument();
  });
  test("does not save a trip selection with a blank name", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderTripManagement({
      initialEntry: "/trips/1/manage?tab=selections",
    });

    const selectionName = screen.getByText("Catamaran & Snorkeling");
    const selectionCard = selectionName.closest(".selection-card");

    await user.click(
      within(selectionCard).getByRole("button", {
        name: "Edit Excursion",
      }),
    );

    const nameInput = within(selectionCard).getByDisplayValue(
      "Catamaran & Snorkeling",
    );

    await user.clear(nameInput);

    await user.click(
      within(selectionCard).getByRole("button", {
        name: "Save",
      }),
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Selection type and name are required.",
    );

    expect(within(selectionCard).getByDisplayValue("")).toBeInTheDocument();

    alertSpy.mockRestore();
  });
});
