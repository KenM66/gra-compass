import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Navbar from "../../components/Navbar";

describe("Navbar", () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    test("logs the user out and clears the authentication session", async () => {
        const user = userEvent.setup();
        const setIsAuthenticated = vi.fn();

        sessionStorage.setItem("isAuthenticated", "true");

        render(
            <MemoryRouter>
                <Navbar setIsAuthenticated={setIsAuthenticated} />
            </MemoryRouter>,
        );

        await user.click(
            screen.getByRole("button", {
                name: "Logout",
            }),
        );

        expect(
            sessionStorage.getItem("isAuthenticated"),
        ).toBeNull();

        expect(setIsAuthenticated).toHaveBeenCalledWith(false);

        expect(setIsAuthenticated).toHaveBeenCalledTimes(1);
    });
    test("provides navigation links to the main application pages", () => {
        render(
            <MemoryRouter>
                <Navbar setIsAuthenticated={vi.fn()} />
            </MemoryRouter>,
        );

        expect(
            screen.getByRole("link", {
                name: "GRA Compass",
            }),
        ).toHaveAttribute("href", "/");

        expect(
            screen.getByRole("link", {
                name: "Dashboard",
            }),
        ).toHaveAttribute("href", "/");

        expect(
            screen.getByRole("link", {
                name: "Reports",
            }),
        ).toHaveAttribute("href", "/reports");

        expect(
            screen.getByRole("link", {
                name: "Settings",
            }),
        ).toHaveAttribute("href", "/settings");
    });
});
