import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";
import Registrations from "../../pages/Registrations";

const renderRegistrations = (tripId) => {
  return render(
    <MemoryRouter initialEntries={[`/trips/${tripId}/registrations`]}>
      <Routes>
        <Route
          path="/trips/:tripId/registrations"
          element={<Registrations />}
        />
      </Routes>
    </MemoryRouter>,
  );
};
describe("Registrations", () => {
  test("displays the correct trip information from the URL", () => {
    renderRegistrations(1);

    expect(
      screen.getByRole("heading", {
        name: "Cancun Incentive Trip",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Cancun, Mexico")).toBeInTheDocument();
  });
});
