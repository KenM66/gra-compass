import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import RegistrationList from "../../components/RegistrationList";

const registrations = [
  {
    travelerNumber: 101,
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    bringingGuest: false,
  },
  {
    travelerNumber: 202,
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria@example.com",
    bringingGuest: true,
  },
];

const renderRegistrationList = () => {
  return render(
    <MemoryRouter>
      <RegistrationList tripId="1" registrations={registrations} />
    </MemoryRouter>,
  );
};
describe("RegistrationList", () => {
  test("displays all registrations before a search is entered", () => {
    renderRegistrationList();

    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("Maria Garcia")).toBeInTheDocument();
  });
  test("filters registrations by name regardless of case", async () => {
    const user = userEvent.setup();

    renderRegistrationList();

    const searchInput = screen.getByPlaceholderText(
      "Search traveler #, name, or email...",
    );

    await user.type(searchInput, "mArIa");

    expect(screen.getByText("Maria Garcia")).toBeInTheDocument();
    expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
  });
  test("filters registrations by traveler number", async () => {
    const user = userEvent.setup();

    renderRegistrationList();

    const searchInput = screen.getByPlaceholderText(
      "Search traveler #, name, or email...",
    );

    await user.type(searchInput, "202");

    expect(screen.getByText("Maria Garcia")).toBeInTheDocument();
    expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
  });
  test("filters registrations by email regardless of case", async () => {
    const user = userEvent.setup();

    renderRegistrationList();

    const searchInput = screen.getByPlaceholderText(
      "Search traveler #, name, or email...",
    );

    await user.type(searchInput, "JOHN@EXAMPLE.COM");

    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.queryByText("Maria Garcia")).not.toBeInTheDocument();
  });
  test("shows a no registrations message when the search has no matches", async () => {
    const user = userEvent.setup();

    renderRegistrationList();

    const searchInput = screen.getByPlaceholderText(
      "Search traveler #, name, or email...",
    );

    await user.type(searchInput, "Nobody Exists");

    expect(screen.getByText("No registrations found.")).toBeInTheDocument();
    expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
    expect(screen.queryByText("Maria Garcia")).not.toBeInTheDocument();
  });
});
