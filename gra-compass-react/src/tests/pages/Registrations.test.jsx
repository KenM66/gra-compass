import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Registrations from "../../pages/Registrations";
import tripsReducer from "../../store/tripsSlice";
import registrationsReducer from "../../store/registrationsSlice";

vi.stubGlobal(
  "fetch",
  vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    }),
  ),
);

const tripId = "6ae7cb5678f43b681c8bd890";

const renderRegistrations = () => {
  const store = configureStore({
    reducer: {
      trips: tripsReducer,
      registrations: registrationsReducer,
    },
    preloadedState: {
      trips: {
        items: [
          {
            id: tripId,
            name: "Cancun Incentive Trip",
            destination: "Cancun, Mexico",
          },
        ],
        status: "succeeded",
        error: null,
      },
      registrations: {
        byTrip: {},
        status: "idle",
        error: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/trips/${tripId}/registrations`]}>
        <Routes>
          <Route
            path="/trips/:tripId/registrations"
            element={<Registrations />}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe("Registrations", () => {
  test("displays the correct trip information from the URL", () => {
    renderRegistrations();

    expect(
      screen.getByRole("heading", {
        name: "Cancun Incentive Trip",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Cancun, Mexico")).toBeInTheDocument();
  });
});
