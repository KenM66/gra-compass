import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, test } from "vitest";
import EmailAddressReportBuilder from "../../components/EmailAddressReportBuilder";

const ReportDestination = () => {
  const location = useLocation();

  return (
    <div data-testid="report-location">
      {location.pathname}
      {location.search}
    </div>
  );
};

describe("EmailAddressReportBuilder", () => {
  test("opens and navigates to the email address report for the selected trip", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<EmailAddressReportBuilder tripId="1" />} />

          <Route
            path="/reports/email-addresses"
            element={<ReportDestination />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const sectionToggle = screen.getByRole("button", {
      name: /E-Mail Address List/,
    });

    expect(sectionToggle).toHaveAttribute("aria-expanded", "false");

    await user.click(sectionToggle);

    expect(sectionToggle).toHaveAttribute("aria-expanded", "true");

    await user.click(
      screen.getByRole("button", {
        name: "Generate Report",
      }),
    );

    expect(screen.getByTestId("report-location")).toHaveTextContent(
      "/reports/email-addresses?tripId=1",
    );
  });
});
