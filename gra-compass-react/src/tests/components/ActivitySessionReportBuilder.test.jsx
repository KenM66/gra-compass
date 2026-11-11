import { render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import ActivitySessionReportBuilder from "../../components/ActivitySessionReportBuilder";
import activitiesReducer from "../../store/activitiesSlice";
import selectionsByTrip from "../../data/mockTripSelections";

const ReportDestination = () => {
  const location = useLocation();

  return (
    <div data-testid="report-location">
      {location.pathname}
      {location.search}
    </div>
  );
};

const renderActivitySessionReportBuilder = (tripId = "1") => {
  const store = configureStore({
    reducer: {
      activities: activitiesReducer,
    },
    preloadedState: {
      activities: {
        byTrip: {
          [tripId]: selectionsByTrip[tripId] || [],
        },
        loading: false,
        error: null,
      },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <ActivitySessionReportBuilder tripId={tripId} />
      </MemoryRouter>
    </Provider>,
  );
};

describe("ActivitySessionReportBuilder", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => selectionsByTrip["1"],
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
  test("disables Generate Report when no sessions are selected", () => {
    renderActivitySessionReportBuilder();

    expect(
      screen.getByRole("button", {
        name: "Generate Report",
      }),
    ).toBeDisabled();
  });
  test("displays activity sessions for the selected trip", () => {
    renderActivitySessionReportBuilder();

    const sessionCheckboxes = screen.getAllByRole("checkbox");

    expect(sessionCheckboxes.length).toBeGreaterThan(0);
  });
  test("enables Generate Report when a session is selected", async () => {
    const user = userEvent.setup();

    renderActivitySessionReportBuilder();

    const sessionCheckboxes = screen.getAllByRole("checkbox");
    const generateButton = screen.getByRole("button", {
      name: "Generate Report",
    });

    expect(generateButton).toBeDisabled();

    await user.click(sessionCheckboxes[0]);

    expect(sessionCheckboxes[0]).toBeChecked();
    expect(generateButton).toBeEnabled();
  });
  test("selects all sessions when Select All is clicked", async () => {
    const user = userEvent.setup();

    renderActivitySessionReportBuilder();

    const sessionCheckboxes = screen.getAllByRole("checkbox");

    await user.click(
      screen.getByRole("button", {
        name: "Select All",
      }),
    );

    sessionCheckboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });

    expect(
      screen.getByRole("button", {
        name: "Generate Report",
      }),
    ).toBeEnabled();
  });
  test("clears all selected sessions when Clear All is clicked", async () => {
    const user = userEvent.setup();

    renderActivitySessionReportBuilder();

    const sessionCheckboxes = screen.getAllByRole("checkbox");
    const generateButton = screen.getByRole("button", {
      name: "Generate Report",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Select All",
      }),
    );

    sessionCheckboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });

    await user.click(
      screen.getByRole("button", {
        name: "Clear All",
      }),
    );

    sessionCheckboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });

    expect(generateButton).toBeDisabled();
  });
  test("collapses and hides the report controls when the section toggle is clicked", async () => {
    const user = userEvent.setup();

    renderActivitySessionReportBuilder();

    const sectionToggle = screen.getByRole("button", {
      name: /Activity Session Schedule/,
    });

    expect(sectionToggle).toHaveAttribute("aria-expanded", "true");

    await user.click(sectionToggle);

    expect(sectionToggle).toHaveAttribute("aria-expanded", "false");

    expect(
      screen.queryByRole("button", {
        name: "Generate Report",
      }),
    ).not.toBeInTheDocument();

    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });
  test("reopens the report controls after the collapsed section is clicked again", async () => {
    const user = userEvent.setup();

    renderActivitySessionReportBuilder();

    const sectionToggle = screen.getByRole("button", {
      name: /Activity Session Schedule/,
    });

    await user.click(sectionToggle);

    expect(
      screen.queryByRole("button", {
        name: "Generate Report",
      }),
    ).not.toBeInTheDocument();

    await user.click(sectionToggle);

    expect(sectionToggle).toHaveAttribute("aria-expanded", "true");

    expect(
      screen.getByRole("button", {
        name: "Generate Report",
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
  });
  test("navigates to the activity session report with the selected session", async () => {
    const user = userEvent.setup();

    const store = configureStore({
      reducer: {
        activities: activitiesReducer,
      },
      preloadedState: {
        activities: {
          byTrip: {
            1: selectionsByTrip["1"],
          },
          loading: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Routes>
            <Route
              path="/"
              element={<ActivitySessionReportBuilder tripId="1" />}
            />

            <Route
              path="/reports/activity-sessions"
              element={<ReportDestination />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
    const sessionCheckboxes = screen.getAllByRole("checkbox");

    await user.click(sessionCheckboxes[0]);

    await user.click(
      screen.getByRole("button", {
        name: "Generate Report",
      }),
    );

    const reportLocation = screen.getByTestId("report-location");

    expect(reportLocation).toHaveTextContent(
      "/reports/activity-sessions?tripId=1&sessionIds=5:501",
    );
  });
  test("includes multiple selected session IDs when generating a report", async () => {
    const user = userEvent.setup();

    const store = configureStore({
      reducer: {
        activities: activitiesReducer,
      },
      preloadedState: {
        activities: {
          byTrip: {
            1: selectionsByTrip["1"],
          },
          loading: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Routes>
            <Route
              path="/"
              element={<ActivitySessionReportBuilder tripId="1" />}
            />

            <Route
              path="/reports/activity-sessions"
              element={<ReportDestination />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    const sessionCheckboxes = screen.getAllByRole("checkbox");

    await user.click(sessionCheckboxes[0]);
    await user.click(sessionCheckboxes[1]);

    await user.click(
      screen.getByRole("button", {
        name: "Generate Report",
      }),
    );

    expect(screen.getByTestId("report-location")).toHaveTextContent(
      "/reports/activity-sessions?tripId=1&sessionIds=5:501,1:101",
    );
  });
});
