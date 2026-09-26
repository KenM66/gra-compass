import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import ActivitySessionReport from "../../pages/ActivitySessionReport";
import userEvent from "@testing-library/user-event";

const renderActivitySessionReport = ({
  initialEntry = "/reports/activity-sessions",
  registrationsByTrip = {},
} = {}) => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ActivitySessionReport registrationsByTrip={registrationsByTrip} />
    </MemoryRouter>,
  );
};

describe("ActivitySessionReport", () => {
  test("displays no report available when required report parameters are missing", () => {
    renderActivitySessionReport();

    expect(
      screen.getByRole("heading", {
        name: "No Report Available",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Select a trip and at least one activity session to generate a report.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Activity Session Report",
      }),
    ).not.toBeInTheDocument();
  });
  test("displays a valid activity session report for the selected trip and session", () => {
    renderActivitySessionReport({
      initialEntry: "/reports/activity-sessions?tripId=1&sessionIds=501",
    });

    expect(
      screen.getByRole("heading", {
        name: "Activity Session Report",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "No Report Available",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Welcome Reception",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("0 attendees · 100 capacity")).toBeInTheDocument();

    expect(
      screen.getByText("No attendees found in current registration data."),
    ).toBeInTheDocument();
  });
  test("displays no report available when the selected session does not exist", () => {
    renderActivitySessionReport({
      initialEntry: "/reports/activity-sessions?tripId=1&sessionIds=999999",
    });

    expect(
      screen.getByRole("heading", {
        name: "No Report Available",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Activity Session Report",
      }),
    ).not.toBeInTheDocument();
  });
  test("displays a primary traveler who is registered for the selected session", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          activities: [
            {
              sessionId: 501,
            },
          ],
        },
      ],
    };

    renderActivitySessionReport({
      initialEntry: "/reports/activity-sessions?tripId=1&sessionIds=501",
      registrationsByTrip,
    });

    expect(screen.getByText("1 attendees · 100 capacity")).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "1001",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Alex Traveler",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("No attendees found in current registration data."),
    ).not.toBeInTheDocument();
  });
  test("displays a guest who is registered for the selected session", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          activities: [],
          guest: {
            firstName: "Jamie",
            lastName: "Guest",
            activities: [
              {
                sessionId: 501,
              },
            ],
          },
        },
      ],
    };

    renderActivitySessionReport({
      initialEntry: "/reports/activity-sessions?tripId=1&sessionIds=501",
      registrationsByTrip,
    });

    expect(screen.getByText("1 attendees · 100 capacity")).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "1001(G)",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Jamie Guest",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("cell", {
        name: "Alex Traveler",
      }),
    ).not.toBeInTheDocument();
  });
  test("displays a guest who is registered for the selected session", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          activities: [],
          guest: {
            firstName: "Jamie",
            lastName: "Guest",
            activities: [
              {
                sessionId: 501,
              },
            ],
          },
        },
      ],
    };

    renderActivitySessionReport({
      initialEntry: "/reports/activity-sessions?tripId=1&sessionIds=501",
      registrationsByTrip,
    });

    expect(screen.getByText("1 attendees · 100 capacity")).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "1001(G)",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Jamie Guest",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("cell", {
        name: "Alex Traveler",
      }),
    ).not.toBeInTheDocument();
  });
  test("displays both the primary traveler and guest when both attend the selected session", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
          activities: [
            {
              sessionId: 501,
            },
          ],
          guest: {
            firstName: "Jamie",
            lastName: "Guest",
            activities: [
              {
                sessionId: 501,
              },
            ],
          },
        },
      ],
    };

    renderActivitySessionReport({
      initialEntry: "/reports/activity-sessions?tripId=1&sessionIds=501",
      registrationsByTrip,
    });

    expect(screen.getByText("2 attendees · 100 capacity")).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "1001",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Alex Traveler",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "1001(G)",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", {
        name: "Jamie Guest",
      }),
    ).toBeInTheDocument();
  });
  test("displays attendees only under the sessions they registered for", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Reception",
          activities: [
            {
              sessionId: 501,
            },
          ],
        },
        {
          travelerNumber: "1002",
          firstName: "Jamie",
          lastName: "Catamaran",
          activities: [
            {
              sessionId: 101,
            },
          ],
        },
      ],
    };

    renderActivitySessionReport({
      initialEntry: "/reports/activity-sessions?tripId=1&sessionIds=501,101",
      registrationsByTrip,
    });

    const reportSections = document.querySelectorAll(
      ".activity-report-session",
    );

    expect(reportSections).toHaveLength(2);

    expect(reportSections[0]).toHaveTextContent("Welcome Reception");
    expect(reportSections[0]).toHaveTextContent("Alex Reception");
    expect(reportSections[0]).not.toHaveTextContent("Jamie Catamaran");

    expect(reportSections[1]).toHaveTextContent("Catamaran & Snorkeling");
    expect(reportSections[1]).toHaveTextContent("Jamie Catamaran");
    expect(reportSections[1]).not.toHaveTextContent("Alex Reception");
  });
  test("handles registrations with no activity or guest data", () => {
    const registrationsByTrip = {
      1: [
        {
          travelerNumber: "1001",
          firstName: "Alex",
          lastName: "Traveler",
        },
      ],
    };

    renderActivitySessionReport({
      initialEntry: "/reports/activity-sessions?tripId=1&sessionIds=501",
      registrationsByTrip,
    });

    expect(screen.getByText("0 attendees · 100 capacity")).toBeInTheDocument();

    expect(
      screen.getByText("No attendees found in current registration data."),
    ).toBeInTheDocument();
  });
  test("opens the browser print dialog when Print / Save as PDF is clicked", async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    renderActivitySessionReport({
      initialEntry: "/reports/activity-sessions?tripId=1&sessionIds=501",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Print / Save as PDF",
      }),
    );

    expect(printSpy).toHaveBeenCalledOnce();

    printSpy.mockRestore();
  });
});
