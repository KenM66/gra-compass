import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Login from "../../pages/Login";
import userEvent from "@testing-library/user-event";

describe("Login", () => {
  test("displays the login page", () => {
    render(
      <MemoryRouter>
        <Login onLogin={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("GRA Compass")).toBeInTheDocument();
  });
  test("displays the email field", () => {
    render(
      <MemoryRouter>
        <Login onLogin={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
  test("displays the password field", () => {
    render(
      <MemoryRouter>
        <Login onLogin={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
  test("displays the login button", () => {
    render(
      <MemoryRouter>
        <Login onLogin={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });
  test("logs in with valid credentials", async () => {
    const user = userEvent.setup();
    const setIsAuthenticated = vi.fn();
    render(
      <MemoryRouter>
        <Login setIsAuthenticated={setIsAuthenticated} />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText(/email/i), "admin@gra.com");
    await user.type(screen.getByLabelText(/password/i), "password");
    await user.click(screen.getByRole("button", { name: /login/i }));
    expect(setIsAuthenticated).toHaveBeenCalledTimes(1);
  });
  test("does not log in with invalid credentials", async () => {
    const user = userEvent.setup();
    const setIsAuthenticated = vi.fn();
    render(
      <MemoryRouter>
        <Login setIsAuthenticated={setIsAuthenticated} />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText(/email/i), "wrong@gra.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /login/i }));
    expect(setIsAuthenticated).not.toHaveBeenCalled();
    expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
  });

  test("accepts email with different capitalization", async () => {
    const user = userEvent.setup();
    const setIsAuthenticated = vi.fn();
    render(
      <MemoryRouter>
        <Login setIsAuthenticated={setIsAuthenticated} />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText(/email/i), "ADMIN@GRA.COM");
    await user.type(screen.getByLabelText(/password/i), "password");
    await user.click(screen.getByRole("button", { name: /login/i }));
    expect(setIsAuthenticated).toHaveBeenCalledWith(true);
  });
});
