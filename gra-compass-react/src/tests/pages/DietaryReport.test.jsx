import { render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import DietaryReport from "../../pages/DietaryReport";
import tripsReducer from "../../store/tripsSlice";
import registrationsReducer from "../../store/registrationsSlice";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise(() => {})),
  );
});

const renderDietaryReport = ({
  initialEntry = "/reports/dietary?tripId=1",
  registrationsByTrip = {},
} = {}) => {
  const store = configureStore({
    reducer: {
      trips: tripsReducer,
      registrations: registrationsReducer,
    },
    preloadedState: {
      trips: {
        items: [
          {
            id: "1",
            name: "Test Trip",
            destination: "Orlando, FL",
          },
        ],
        status: "idle",
        error: null,
      },
      registrations: {
        byTrip: registrationsByTrip,
        status: "idle",
        error: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <DietaryReport />
      </MemoryRouter>
    </Provider>,
  );
};

describe("DietaryReport", () => {
  test("displays no report available and disables printing when no dietary restrictions exist", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          bringingGuest: false,
          dietaryRequirements: "None",
        },
      ],
    };

    renderDietaryReport({
      registrationsByTrip,
    });

    expect(
      screen.getByRole("heading", {
        name: "No Dietary Restrictions Report Available",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "No travelers with dietary restrictions were found for this trip.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Print / Save as PDF",
      }),
    ).toBeDisabled();

    expect(
      screen.queryByRole("heading", {
        name: "Dietary Restrictions Report",
      }),
    ).not.toBeInTheDocument();
  });
  test("displays a primary traveler with a dietary restriction", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          bringingGuest: false,
          dietaryRequirements: "Gluten-free",
        },
      ],
    };

    renderDietaryReport({
      registrationsByTrip,
    });

    expect(
      screen.getByRole("heading", {
        name: "Dietary Restrictions Report",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("1 traveler with reported dietary restrictions"),
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
        name: "Gluten-free",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Print / Save as PDF",
      }),
    ).toBeEnabled();
  });
  test("displays a guest with a dietary restriction", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          bringingGuest: true,
          dietaryRequirements: "None",
          guest: {
            firstName: "Jamie",
            lastName: "Guest",
            dietaryRequirements: "Peanut allergy",
          },
        },
      ],
    };

    renderDietaryReport({
      registrationsByTrip,
    });

    expect(
      screen.getByText("1 traveler with reported dietary restrictions"),
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
        name: "Peanut allergy",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("cell", {
        name: "Alex Traveler",
      }),
    ).not.toBeInTheDocument();
  });
  test("displays both primary traveler and guest when both have dietary restrictions", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          bringingGuest: true,
          dietaryRequirements: "Gluten-free",
          guest: {
            firstName: "Jamie",
            lastName: "Guest",
            dietaryRequirements: "Peanut allergy",
          },
        },
      ],
    };

    renderDietaryReport({
      registrationsByTrip,
    });

    expect(
      screen.getByText("2 travelers with reported dietary restrictions"),
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
        name: "Gluten-free",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Peanut allergy",
      }),
    ).toBeInTheDocument();
  });
});
