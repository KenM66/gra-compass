import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import RegistrationReport from "../../pages/RegistrationReport";
import userEvent from "@testing-library/user-event";

const renderRegistrationReport = ({
  initialEntry = "/reports/registrations?tripId=1",
  registrationsByTrip = {},
} = {}) => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <RegistrationReport registrationsByTrip={registrationsByTrip} />
    </MemoryRouter>,
  );
};

describe("RegistrationReport", () => {
  test("displays no report available and disables printing when no registrations exist", () => {
    renderRegistrationReport();

    expect(
      screen.getByRole("heading", {
        name: "No Report Available",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No registrations were found for the selected trip."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Print / Save as PDF",
      }),
    ).toBeDisabled();

    expect(
      screen.queryByRole("heading", {
        name: "Registration Report",
      }),
    ).not.toBeInTheDocument();
  });
  test("displays a report for a single registration", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          email: "alex@example.com",
          phone: "555-123-4567",
          bringingGuest: false,
        },
      ],
    };

    renderRegistrationReport({
      registrationsByTrip,
    });

    expect(
      screen.getByRole("heading", {
        name: "Registration Report",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("1 registration")).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "1001",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Alex Traveler",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "alex@example.com",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "555-123-4567",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "No",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Print / Save as PDF",
      }),
    ).toBeEnabled();
  });
  test("displays guest information when a registration includes a guest", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          email: "alex@example.com",
          phone: "555-123-4567",
          bringingGuest: true,
          guest: {
            firstName: "Jamie",
            lastName: "Guest",
          },
        },
      ],
    };

    renderRegistrationReport({
      registrationsByTrip,
    });

    expect(
      screen.getByRole("cell", {
        name: "Yes",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Jamie Guest",
      }),
    ).toBeInTheDocument();
  });
  test("displays the plural registration count when multiple registrations exist", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          email: "alex@example.com",
          phone: "555-123-4567",
          bringingGuest: false,
        },
        {
          travelerNumber: "1002",
          firstName: "Jamie",
          lastName: "Traveler",
          email: "jamie@example.com",
          phone: "555-987-6543",
          bringingGuest: false,
        },
      ],
    };

    renderRegistrationReport({
      registrationsByTrip,
    });

    expect(screen.getByText("2 registrations")).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Alex Traveler",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Jamie Traveler",
      }),
    ).toBeInTheDocument();
  });
  test("opens the browser print dialog for a valid registration report", async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          email: "alex@example.com",
          phone: "555-123-4567",
          bringingGuest: false,
        },
      ],
    };

    renderRegistrationReport({
      registrationsByTrip,
    });

    await user.click(
      screen.getByRole("button", {
        name: "Print / Save as PDF",
      }),
    );

    expect(printSpy).toHaveBeenCalledOnce();

    printSpy.mockRestore();
  });
});
