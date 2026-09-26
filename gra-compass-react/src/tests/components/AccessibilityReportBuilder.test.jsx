import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, test } from "vitest";
import AccessibilityReportBuilder from "../../components/AccessibilityReportBuilder";

const ReportDestination = () => {
  const location = useLocation();

  return (
    <div data-testid="report-location">
      {location.pathname}
      {location.search}
    </div>
  );
};

describe("AccessibilityReportBuilder", () => {
  test("opens and navigates to the accessibility report for the selected trip", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AccessibilityReportBuilder tripId="1" />} />

          <Route
            path="/reports/accessibility"
            element={<ReportDestination />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const sectionToggle = screen.getByRole("button", {
      name: /Accessibility Needs Report/,
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
      "/reports/accessibility?tripId=1",
    );
  });
});
