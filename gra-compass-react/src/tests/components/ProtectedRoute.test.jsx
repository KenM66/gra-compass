import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";
import ProtectedRoute from "../../components/ProtectedRoute";

describe("ProtectedRoute", () => {
  test("displays protected content when user is authenticated", () => {
    render(
      <MemoryRouter>
        <ProtectedRoute isAuthenticated={true}>
          <div>Secret GRA Stuff</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Secret GRA Stuff")).toBeInTheDocument();
  });
  test("redirects unauthenticated user to login", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute isAuthenticated={false}>
                <div>Secret GRA Stuff</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Secret GRA Stuff")).not.toBeInTheDocument();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
