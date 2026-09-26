import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import RegistrationDetails from "../../pages/RegistrationDetails";

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
  departureAirport: "CLE",
  tsaPrecheck: true,
  passportNumber: "123456789",
  passportExpiration: "August 12, 2030",
  passportIssuingCountry: "United States",
  sex: "Male",
  nationality: "American",
  citizenship: "United States",
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
      id: 1,
      type: "Excursion",
      name: "Catamaran & Snorkeling",
      sessionId: 101,
    },
    {
      id: 4,
      type: "Spa",
      name: "Massage Appointment",
      sessionId: 401,
    },
  ],
};

const registrationsByTrip = {
  1: [registration],
};

const renderRegistrationDetails = (
  testRegistrationsByTrip = registrationsByTrip,
) => {
  const setRegistrationsByTrip = vi.fn();

  render(
    <MemoryRouter initialEntries={["/trips/1/registrations/1047"]}>
      <Routes>
        <Route
          path="/trips/:tripId/registrations/:id"
          element={
            <RegistrationDetails
              registrationsByTrip={testRegistrationsByTrip}
              setRegistrationsByTrip={setRegistrationsByTrip}
            />
          }
        />
      </Routes>
    </MemoryRouter>,
  );

  return { setRegistrationsByTrip };
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

    const { setRegistrationsByTrip } = renderRegistrationDetails();

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

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(setRegistrationsByTrip).toHaveBeenCalledTimes(1);
    const updateRegistrations = setRegistrationsByTrip.mock.calls[0][0];

    const updatedRegistrations = updateRegistrations(registrationsByTrip);

    expect(updatedRegistrations[1][0].firstName).toBe("Bob");
    expect(updatedRegistrations[1][0].email).toBe("bob@example.com");
    expect(updatedRegistrations[1][0].lastName).toBe("Henderson");
    expect(updatedRegistrations[1][0].travelerNumber).toBe(1047);
  });
  test("cancels personal information changes without saving them", async () => {
    const user = userEvent.setup();

    const { setRegistrationsByTrip } = renderRegistrationDetails();

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

    expect(setRegistrationsByTrip).not.toHaveBeenCalled();

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

    const { setRegistrationsByTrip } = renderRegistrationDetails();

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

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(setRegistrationsByTrip).toHaveBeenCalledTimes(1);

    const updateRegistrations = setRegistrationsByTrip.mock.calls[0][0];

    const updatedRegistrations = updateRegistrations(registrationsByTrip);

    expect(updatedRegistrations[1][0].tsaPrecheck).toBe(false);
    expect(updatedRegistrations[1][0].travelerNumber).toBe(1047);
  });
  test("keeps the guest when guest removal is cancelled", async () => {
    const user = userEvent.setup();

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    const { setRegistrationsByTrip } = renderRegistrationDetails();

    expect(screen.getByText("Amanda Henderson")).toBeInTheDocument();
    expect(screen.getByText("amanda@example.com")).toBeInTheDocument();

    const yesButtons = screen.getAllByRole("button", {
      name: "Yes",
    });

    const guestToggle = yesButtons[0];

    await user.click(guestToggle);

    expect(confirmSpy).toHaveBeenCalledTimes(1);

    expect(setRegistrationsByTrip).not.toHaveBeenCalled();

    expect(screen.getByText("Amanda Henderson")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
  test("removes the guest when guest removal is confirmed", async () => {
    const user = userEvent.setup();

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    const { setRegistrationsByTrip } = renderRegistrationDetails();

    const guestToggle = screen.getByRole("button", {
      name: "Yes",
    });

    await user.click(guestToggle);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(setRegistrationsByTrip).toHaveBeenCalledTimes(1);

    const updateRegistrations = setRegistrationsByTrip.mock.calls[0][0];

    const updatedRegistrations = updateRegistrations(registrationsByTrip);

    expect(updatedRegistrations[1][0].bringingGuest).toBe(false);
    expect(updatedRegistrations[1][0].guest).toBeNull();

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

    const { setRegistrationsByTrip } = renderRegistrationDetails(
      testRegistrationsByTrip,
    );

    const guestToggle = screen.getByRole("button", {
      name: "No",
    });

    await user.click(guestToggle);

    expect(setRegistrationsByTrip).toHaveBeenCalledTimes(1);

    const updateRegistrations = setRegistrationsByTrip.mock.calls[0][0];

    const updatedRegistrations = updateRegistrations(testRegistrationsByTrip);

    expect(updatedRegistrations[1][0].bringingGuest).toBe(true);

    expect(updatedRegistrations[1][0].guest).toEqual({
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
      dietaryRestrictions: "",
    });
  });
  test("does not save a trip selection without a session", async () => {
    const user = userEvent.setup();

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const { setRegistrationsByTrip } = renderRegistrationDetails();

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

    expect(setRegistrationsByTrip).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
  test("adds a trip selection with its selected session", async () => {
    const user = userEvent.setup();

    const { setRegistrationsByTrip } = renderRegistrationDetails();

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

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(setRegistrationsByTrip).toHaveBeenCalledTimes(1);

    const updateRegistrations = setRegistrationsByTrip.mock.calls[0][0];

    const updatedRegistrations = updateRegistrations(registrationsByTrip);

    expect(updatedRegistrations[1][0].activities).toContainEqual({
      id: 2,
      type: "Excursion",
      name: "Island Jeep Tour",
      sessionId: 201,
    });
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

    const fullSessionRegistrations = Array.from({ length: 12 }, (_, index) => ({
      ...registration,
      travelerNumber: 2000 + index,
      activities: [
        {
          id: 2,
          type: "Excursion",
          name: "Island Jeep Tour",
          sessionId: 201,
        },
      ],
    }));

    const testRegistrationsByTrip = {
      1: [registration, ...fullSessionRegistrations],
    };

    renderRegistrationDetails(testRegistrationsByTrip);

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    await user.click(editButtons[5]);

    const fullSession = screen.getByRole("radio", {
      name: /Wednesday, March 10.*9:00 AM.*Full/i,
    });

    expect(fullSession).toBeDisabled();
  });
});
