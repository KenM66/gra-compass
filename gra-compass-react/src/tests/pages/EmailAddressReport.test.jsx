import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import EmailAddressReport from "../../pages/EmailAddressReport";

const renderEmailAddressReport = ({
  initialEntry = "/reports/email-addresses?tripId=1",
  registrationsByTrip = {},
} = {}) => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <EmailAddressReport registrationsByTrip={registrationsByTrip} />
    </MemoryRouter>,
  );
};

describe("EmailAddressReport", () => {
  test("displays primary traveler email addresses", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          email: "alex@example.com",
        },
        {
          travelerNumber: "1002",
          email: "taylor@example.com",
        },
      ],
    };

    renderEmailAddressReport({
      registrationsByTrip,
    });

    expect(
      screen.getByRole("heading", {
        name: "E-Mail Address List",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("alex@example.com, taylor@example.com"),
    ).toBeInTheDocument();
  });
  test("includes guest email addresses", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          email: "alex@example.com",
          guest: {
            email: "jamie@example.com",
          },
        },
      ],
    };

    renderEmailAddressReport({
      registrationsByTrip,
    });

    expect(
      screen.getByText("alex@example.com, jamie@example.com"),
    ).toBeInTheDocument();
  });
  test("removes duplicate email addresses", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          email: "shared@example.com",
          guest: {
            email: "shared@example.com",
          },
        },
        {
          travelerNumber: "1002",
          email: "taylor@example.com",
        },
      ],
    };

    renderEmailAddressReport({
      registrationsByTrip,
    });

    expect(
      screen.getByText("shared@example.com, taylor@example.com"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "shared@example.com, taylor@example.com, shared@example.com",
      ),
    ).not.toBeInTheDocument();
  });
});
