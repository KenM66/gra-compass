import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import RegistrationSummary from "../../components/RegistrationSummary";
import userEvent from "@testing-library/user-event";

describe("RegistrationSummary", () => {
    test("displays the registration status, counts, and formatted close date", () => {
        render(
            <RegistrationSummary
                status="Open"
                registrationCount={12}
                travelerCount={18}
                registrationCloseDate="2027-02-15"
                onEditSettings={vi.fn()}
            />,
        );

        expect(
            screen.getByRole("heading", {
                name: "Registration Summary",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Open"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("12"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("18"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Including guests"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("February 15, 2027"),
        ).toBeInTheDocument();
    });
    test("calls the edit settings handler and displays the no close date fallback", async () => {
        const user = userEvent.setup();
        const onEditSettings = vi.fn();

        render(
            <RegistrationSummary
                status="Paused"
                registrationCount={5}
                travelerCount={7}
                registrationCloseDate=""
                onEditSettings={onEditSettings}
            />,
        );

        expect(
            screen.getByText("No close date set"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Paused"),
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", {
                name: "Edit Settings",
            }),
        );

        expect(onEditSettings).toHaveBeenCalledTimes(1);
    });
});