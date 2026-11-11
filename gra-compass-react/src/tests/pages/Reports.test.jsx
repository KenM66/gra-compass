import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import tripsReducer from "../../store/tripsSlice";
import Reports from "../../pages/Reports";
import activitiesReducer from "../../store/activitiesSlice";

const renderReports = () => {
  const store = configureStore({
    reducer: {
      trips: tripsReducer,
      activities: activitiesReducer,
    },
    preloadedState: {
      trips: {
        items: [
          {
            id: "6ae7cb5678f43b681c8bd890",
            name: "Test Trip",
            destination: "Orlando, FL",
          },
        ],
        status: "idle",
        error: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    </Provider>,
  );
};

describe("Reports", () => {
  test("displays the reports page and trip selector", () => {
    renderReports();

    expect(
      screen.getByRole("heading", {
        name: "Reports",
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Trip")).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Select a trip...",
      }),
    ).toBeInTheDocument();
  });
  test("does not display report builders before a trip is selected", () => {
    const { container } = renderReports();

    expect(
      container.querySelector(".reports-builders"),
    ).not.toBeInTheDocument();
  });
  test("displays report builders after a trip is selected", async () => {
    const user = userEvent.setup();

    const { container } = renderReports();

    const tripSelect = screen.getByLabelText("Trip");
    const tripOptions = screen.getAllByRole("option");

    await user.selectOptions(tripSelect, tripOptions[1]);

    expect(container.querySelector(".reports-builders")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Mailing Labels/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Name Tag List/,
      }),
    ).toBeInTheDocument();
  });
  test("hides report builders when the trip selection is cleared", async () => {
    const user = userEvent.setup();

    const { container } = renderReports();

    const tripSelect = screen.getByLabelText("Trip");
    const tripOptions = screen.getAllByRole("option");

    await user.selectOptions(tripSelect, tripOptions[1]);

    expect(container.querySelector(".reports-builders")).toBeInTheDocument();

    await user.selectOptions(tripSelect, "");

    expect(
      container.querySelector(".reports-builders"),
    ).not.toBeInTheDocument();
  });
});
