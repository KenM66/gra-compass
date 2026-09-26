import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import AccessibilityReport from "../../pages/AccessibilityReport";

const renderAccessibilityReport = ({
  initialEntry = "/reports/accessibility?tripId=1",
  registrationsByTrip = {},
} = {}) => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AccessibilityReport registrationsByTrip={registrationsByTrip} />
    </MemoryRouter>,
  );
};

describe("AccessibilityReport", () => {
  test("displays no report available and disables printing when no accessibility needs exist", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          phone: "555-123-4567",
          bringingGuest: false,
          accessibility: "None",
        },
      ],
    };

    renderAccessibilityReport({
      registrationsByTrip,
    });

    expect(
      screen.getByRole("heading", {
        name: "No Accessibility Needs Report Available",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "No travelers with accessibility needs were found for this trip.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Print / Save as PDF",
      }),
    ).toBeDisabled();

    expect(
      screen.queryByRole("heading", {
        name: "Accessibility Needs Report",
      }),
    ).not.toBeInTheDocument();
  });
  test("displays a primary traveler with an accessibility need", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          phone: "555-123-4567",
          bringingGuest: false,
          accessibility: "Wheelchair assistance",
        },
      ],
    };

    renderAccessibilityReport({
      registrationsByTrip,
    });

    expect(
      screen.getByRole("heading", {
        name: "Accessibility Needs Report",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("1 traveler with reported accessibility needs"),
    ).toBeInTheDocument();

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
        name: "Primary",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Wheelchair assistance",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Print / Save as PDF",
      }),
    ).toBeEnabled();
  });
  test("displays a guest with an accessibility need", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          phone: "555-123-4567",
          bringingGuest: true,
          accessibility: "None",
          guest: {
            firstName: "Jamie",
            lastName: "Guest",
            accessibility: "Hearing assistance",
          },
        },
      ],
    };

    renderAccessibilityReport({
      registrationsByTrip,
    });

    expect(
      screen.getByText("1 traveler with reported accessibility needs"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Jamie Guest",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Guest",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Hearing assistance",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("cell", {
        name: "Alex Traveler",
      }),
    ).not.toBeInTheDocument();
  });
  test("displays both primary traveler and guest when both have accessibility needs", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          phone: "555-123-4567",
          bringingGuest: true,
          accessibility: "Wheelchair assistance",
          guest: {
            firstName: "Jamie",
            lastName: "Guest",
            accessibility: "Hearing assistance",
          },
        },
      ],
    };

    renderAccessibilityReport({
      registrationsByTrip,
    });

    expect(
      screen.getByText("2 travelers with reported accessibility needs"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Alex Traveler",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Jamie Guest",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Wheelchair assistance",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Hearing assistance",
      }),
    ).toBeInTheDocument();
  });
  test("treats accessibility values of none as no reported need regardless of capitalization", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          phone: "555-123-4567",
          bringingGuest: true,
          accessibility: "NONE",
          guest: {
            firstName: "Jamie",
            lastName: "Guest",
            accessibility: "none",
          },
        },
      ],
    };

    renderAccessibilityReport({
      registrationsByTrip,
    });

    expect(
      screen.getByRole("heading", {
        name: "No Accessibility Needs Report Available",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("cell", {
        name: "Alex Traveler",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("cell", {
        name: "Jamie Guest",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Print / Save as PDF",
      }),
    ).toBeDisabled();
  });
});
