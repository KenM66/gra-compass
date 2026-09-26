import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Reports from "../../pages/Reports";

describe("Reports", () => {
  test("displays the reports page and trip selector", () => {
    render(<Reports />);

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
    const { container } = render(<Reports />);

    expect(
      container.querySelector(".reports-builders"),
    ).not.toBeInTheDocument();
  });
  test("displays report builders after a trip is selected", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>,
    );

    const tripSelect = screen.getByLabelText("Trip");
    const tripOptions = screen.getAllByRole("option");

    await user.selectOptions(tripSelect, tripOptions[1]);

    expect(container.querySelector(".reports-builders")).toBeInTheDocument();
  });
  test("hides report builders when the trip selection is cleared", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>,
    );

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
