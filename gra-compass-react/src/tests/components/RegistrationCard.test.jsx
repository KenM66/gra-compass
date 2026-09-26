import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";
import RegistrationCard from "../../components/RegistrationCard";

const renderRegistrationCard = (bringingGuest = true) => {
  return render(
    <MemoryRouter>
      <RegistrationCard
        tripId="1"
        travelerNumber={101}
        name="John Smith"
        email="john@example.com"
        bringingGuest={bringingGuest}
      />
    </MemoryRouter>,
  );
};
describe("RegistrationCard", () => {
  test("displays the traveler information", () => {
    renderRegistrationCard();

    expect(screen.getByText("Traveler #101")).toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });
  test("navigates to the correct registration when clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <RegistrationCard
                tripId="1"
                travelerNumber={101}
                name="John Smith"
                email="john@example.com"
                bringingGuest={true}
              />
            }
          />

          <Route
            path="/trips/:tripId/registrations/:travelerNumber"
            element={<div>Registration Details Page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole("button", {
        name: /traveler #101/i,
      }),
    );

    expect(screen.getByText("Registration Details Page")).toBeInTheDocument();
  });
  test("navigates to the registration when activated with Enter", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <RegistrationCard
                tripId="1"
                travelerNumber={101}
                name="John Smith"
                email="john@example.com"
                bringingGuest={true}
              />
            }
          />

          <Route
            path="/trips/:tripId/registrations/:travelerNumber"
            element={<div>Registration Details Page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    const registrationCard = screen.getByRole("button", {
      name: /traveler #101/i,
    });

    registrationCard.focus();

    expect(registrationCard).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(screen.getByText("Registration Details Page")).toBeInTheDocument();
  });
  test("navigates to the registration when activated with Space", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <RegistrationCard
                tripId="1"
                travelerNumber={101}
                name="John Smith"
                email="john@example.com"
                bringingGuest={true}
              />
            }
          />

          <Route
            path="/trips/:tripId/registrations/:travelerNumber"
            element={<div>Registration Details Page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    const registrationCard = screen.getByRole("button", {
      name: /traveler #101/i,
    });

    registrationCard.focus();

    await user.keyboard(" ");

    expect(screen.getByText("Registration Details Page")).toBeInTheDocument();
  });
});
