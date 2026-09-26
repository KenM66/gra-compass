import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import FlightBookingReport from "../../pages/FlightBookingReport";

const renderFlightBookingReport = ({
  initialEntry = "/reports/flight-booking?tripId=1",
  registrationsByTrip = {},
} = {}) => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <FlightBookingReport registrationsByTrip={registrationsByTrip} />
    </MemoryRouter>,
  );
};

describe("FlightBookingReport", () => {
  test("displays no report available and disables printing when no travelers require flight booking", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          bringingGuest: false,
          airport: "",
        },
      ],
    };

    renderFlightBookingReport({
      registrationsByTrip,
    });

    expect(
      screen.getByRole("heading", {
        name: "No Flight Booking Report Available",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "No travelers requiring GRA flight booking were found for this trip.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Print / Save as PDF",
      }),
    ).toBeDisabled();

    expect(
      screen.queryByRole("heading", {
        name: "Flight Booking Report",
      }),
    ).not.toBeInTheDocument();
  });
  test("displays a primary traveler requiring flight booking", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          bringingGuest: false,
          airport: "CLE",
          dateOfBirth: "1985-06-15",
          sex: "Male",
          nationality: "American",
          citizenship: "United States",
          passportNumber: "",
          passportExpiration: "",
          tsaPrecheck: true,
          accessibility: "Wheelchair assistance",
          dietaryRequirements: "Gluten-free",
        },
      ],
    };

    renderFlightBookingReport({
      registrationsByTrip,
    });

    expect(
      screen.getByRole("heading", {
        name: "Flight Booking Report",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("1 traveler requiring flight booking"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "CLE",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Primary",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Alex",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Traveler",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Yes",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Wheelchair assistance",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Gluten-free",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("cell", {
        name: "N/A",
      }),
    ).toHaveLength(2);

    expect(
      screen.getByRole("button", {
        name: "Print / Save as PDF",
      }),
    ).toBeEnabled();
  });
  test("displays a guest requiring flight booking", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          bringingGuest: true,
          airport: "",
          guest: {
            firstName: "Jamie",
            lastName: "Guest",
            airport: "ORD",
            dateOfBirth: "1990-08-20",
            sex: "Female",
            nationality: "American",
            citizenship: "United States",
            passportNumber: "P12345678",
            passportExpiration: "2030-08-20",
            tsaPrecheck: false,
            accessibility: "None",
            dietaryRequirements: "Vegetarian",
          },
        },
      ],
    };

    renderFlightBookingReport({
      registrationsByTrip,
    });

    expect(
      screen.getByText("1 traveler requiring flight booking"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "ORD",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Jamie",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "P12345678",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "2030-08-20",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "No",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Vegetarian",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("cell", {
        name: "Alex",
      }),
    ).not.toBeInTheDocument();
  });
  test("displays both primary traveler and guest when both require flight booking", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          bringingGuest: true,
          airport: "CLE",
          tsaPrecheck: true,
          guest: {
            firstName: "Jamie",
            lastName: "Guest",
            airport: "ORD",
            tsaPrecheck: false,
          },
        },
      ],
    };

    renderFlightBookingReport({
      registrationsByTrip,
    });

    expect(
      screen.getByText("2 travelers requiring flight booking"),
    ).toBeInTheDocument();

    const alexCell = screen.getByRole("cell", {
      name: "Alex",
    });
    const alexRow = alexCell.closest("tr");

    expect(
      within(alexRow).getByRole("cell", {
        name: "CLE",
      }),
    ).toBeInTheDocument();

    expect(
      within(alexRow).getByRole("cell", {
        name: "Primary",
      }),
    ).toBeInTheDocument();

    expect(
      within(alexRow).getByRole("cell", {
        name: "Yes",
      }),
    ).toBeInTheDocument();

    const jamieCell = screen.getByRole("cell", {
      name: "Jamie",
    });
    const jamieRow = jamieCell.closest("tr");

    expect(
      within(jamieRow).getByRole("cell", {
        name: "ORD",
      }),
    ).toBeInTheDocument();

    expect(within(jamieRow).getAllByRole("cell")[1]).toHaveTextContent("Guest");

    expect(
      within(jamieRow).getByRole("cell", {
        name: "No",
      }),
    ).toBeInTheDocument();
  });
});
