import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";
import Dashboard from "../../pages/Dashboard";

const trips = [
  {
    id: 1,
    name: "Upcoming Trip",
    destination: "Orlando, FL",
    startDate: "2099-06-01",
    endDate: "2099-06-07",
  },
  {
    id: 2,
    name: "Archived Trip",
    destination: "Las Vegas, NV",
    startDate: "2020-06-01",
    endDate: "2020-06-07",
  },
];

const registrationsByTrip = {
  1: [
    {
      id: 101,
      bringingGuest: false,
      guest: null,
    },
    {
      id: 102,
      bringingGuest: true,
      guest: {
        firstName: "Guest",
        lastName: "One",
      },
    },
    {
      id: 103,
      bringingGuest: true,
      guest: {
        firstName: "Guest",
        lastName: "Two",
      },
    },
  ],
  2: [],
};

const renderDashboard = () => {
  return render(
    <MemoryRouter>
      <Dashboard trips={trips} registrationsByTrip={registrationsByTrip} />
    </MemoryRouter>,
  );
};
const getTodayDateString = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

describe("Dashboard", () => {
  test("hides archived trips by default", () => {
    renderDashboard();

    expect(screen.getByText("Upcoming Trip")).toBeInTheDocument();
    expect(screen.queryByText("Archived Trip")).not.toBeInTheDocument();
  });
  test("shows archived trips when the archived trips checkbox is checked", async () => {
    const user = userEvent.setup();

    renderDashboard();

    const archivedTripsCheckbox = screen.getByRole("checkbox", {
      name: /show archived trips/i,
    });

    await user.click(archivedTripsCheckbox);

    expect(screen.getByText("Upcoming Trip")).toBeInTheDocument();
    expect(screen.getByText("Archived Trip")).toBeInTheDocument();
  });
  test("shows a trip through the end of its end date", () => {
    const today = getTodayDateString();

    const tripsEndingToday = [
      {
        id: 3,
        name: "Trip Ending Today",
        destination: "Chicago, IL",
        startDate: today,
        endDate: today,
      },
    ];

    render(
      <MemoryRouter>
        <Dashboard trips={tripsEndingToday} registrationsByTrip={{ 3: [] }} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Trip Ending Today")).toBeInTheDocument();
  });
  test("displays the correct registration and traveler counts", () => {
    renderDashboard();

    expect(
      screen.getByText((content, element) => {
        return (
          element.tagName.toLowerCase() === "p" &&
          element.textContent.includes("3 Registrations") &&
          element.textContent.includes("5 Travelers")
        );
      }),
    ).toBeInTheDocument();
  });
  test("does not count a guest when the guest information is missing", () => {
    const registrationsWithMissingGuest = {
      1: [
        {
          id: 201,
          bringingGuest: true,
          guest: null,
        },
      ],
    };

    render(
      <MemoryRouter>
        <Dashboard
          trips={[trips[0]]}
          registrationsByTrip={registrationsWithMissingGuest}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByText((content, element) => {
        return (
          element.tagName.toLowerCase() === "p" &&
          element.textContent.includes("1 Registration") &&
          element.textContent.includes("1 Traveler")
        );
      }),
    ).toBeInTheDocument();
  });
  test("navigates to the create trip page when Create Trip is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Dashboard trips={trips} registrationsByTrip={registrationsByTrip} />
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole("button", {
        name: /create trip/i,
      }),
    );

    expect(window.location.pathname).toBe("/");
  });
  test("navigates to the create trip page when Create Trip is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                trips={trips}
                registrationsByTrip={registrationsByTrip}
              />
            }
          />
          <Route path="/trips/create" element={<div>Create Trip Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole("button", {
        name: /create trip/i,
      }),
    );

    expect(screen.getByText("Create Trip Page")).toBeInTheDocument();
  });
  test("navigates to the correct manage trip page", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                trips={[trips[0]]}
                registrationsByTrip={registrationsByTrip}
              />
            }
          />
          <Route
            path="/trips/:tripId/manage"
            element={<div>Manage Trip Page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole("button", {
        name: /manage trip/i,
      }),
    );

    expect(screen.getByText("Manage Trip Page")).toBeInTheDocument();
  });
});
