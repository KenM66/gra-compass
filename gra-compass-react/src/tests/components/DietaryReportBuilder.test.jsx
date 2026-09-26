import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, test } from "vitest";
import DietaryReportBuilder from "../../components/DietaryReportBuilder";

const ReportDestination = () => {
  const location = useLocation();

  return (
    <div data-testid="report-location">
      {location.pathname}
      {location.search}
    </div>
  );
};

describe("DietaryReportBuilder", () => {
  test("opens and navigates to the dietary report for the selected trip", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<DietaryReportBuilder tripId="1" />} />

          <Route path="/reports/dietary" element={<ReportDestination />} />
        </Routes>
      </MemoryRouter>,
    );

    const sectionToggle = screen.getByRole("button", {
      name: /Dietary Restrictions Report/,
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
      "/reports/dietary?tripId=1",
    );
  });
});
