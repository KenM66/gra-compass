import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, test } from "vitest";
import RegistrationReportBuilder from "../../components/RegistrationReportBuilder";
import userEvent from "@testing-library/user-event";

const ReportDestination = () => {
  const location = useLocation();

  return (
    <div data-testid="report-location">
      {location.pathname}
      {location.search}
    </div>
  );
};

const renderRegistrationReportBuilder = (tripId = "1") => {
  render(
    <MemoryRouter>
      <RegistrationReportBuilder tripId={tripId} />
    </MemoryRouter>,
  );
};

describe("RegistrationReportBuilder", () => {
  test("starts collapsed with the report controls hidden", () => {
    renderRegistrationReportBuilder();

    const sectionToggle = screen.getByRole("button", {
      name: /Registration Report/,
    });

    expect(sectionToggle).toHaveAttribute("aria-expanded", "false");

    expect(
      screen.queryByRole("button", {
        name: "Generate Report",
      }),
    ).not.toBeInTheDocument();
  });
  test("opens and displays the report controls when the section is clicked", async () => {
    const user = userEvent.setup();

    renderRegistrationReportBuilder();

    const sectionToggle = screen.getByRole("button", {
      name: /Registration Report/,
    });

    await user.click(sectionToggle);

    expect(sectionToggle).toHaveAttribute("aria-expanded", "true");

    expect(
      screen.getByRole("button", {
        name: "Generate Report",
      }),
    ).toBeInTheDocument();
  });
});
