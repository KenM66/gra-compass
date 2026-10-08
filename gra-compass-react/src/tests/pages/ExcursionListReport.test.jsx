// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ExcursionListReport from "../../pages/ExcursionListReport";

const registrationsByTrip = {
    1: [
        {
            travelerNumber: 1047,
            firstName: "Robert",
            preferredName: "Rob",
            lastName: "Henderson",
            role: "Attendee",
            activities: [
                {
                    id: 2,
                    type: "Excursion",
                    name: "Island Jeep Tour",
                    sessionId: 201,
                },
                {
                    id: 1,
                    type: "Excursion",
                    name: "Catamaran & Snorkeling",
                    sessionId: 101,
                },
                {
                    id: 99,
                    type: "Dinner",
                    name: "Welcome Dinner",
                    sessionId: 999,
                },
            ],
            guest: {
                firstName: "Amanda",
                lastName: "Stuart",
                activities: [
                    {
                        id: 1,
                        type: "Excursion",
                        name: "Catamaran & Snorkeling",
                        sessionId: 102,
                    },
                    {
                        id: 3,
                        type: "Excursion",
                        name: "Sunset Dinner Cruise",
                        sessionId: 302,
                    },
                ],
            },
        },
        {
            travelerNumber: 1048,
            firstName: "Amanda",
            lastName: "Reynolds",
            role: "Sales Representative",
            activities: [],
            guest: null,
        },
    ],
    2: [],
};

const renderReport = (tripId = "1") => {
    render(
        <MemoryRouter initialEntries={[`/reports/excursion-list?tripId=${tripId}`]}>
            <ExcursionListReport registrationsByTrip={registrationsByTrip} />
        </MemoryRouter>,
    );
};

describe("ExcursionListReport", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("uses the preferred name when one is available", () => {
        renderReport();

        const row = screen.getByText("Rob").closest("tr");

        expect(within(row).getByText("Rob")).toBeInTheDocument();
        expect(within(row).getByText("Henderson")).toBeInTheDocument();
        expect(within(row).getByText("Attendee")).toBeInTheDocument();
    });

    it("uses the first name when no preferred name is available", () => {
        renderReport();

        const row = screen.getByText("Reynolds").closest("tr");

        expect(within(row).getByText("Amanda")).toBeInTheDocument();
        expect(
            within(row).getByText("Sales Representative"),
        ).toBeInTheDocument();
    });

    it("creates a separate guest row and labels the role as Guest", () => {
        renderReport();

        const row = screen.getByText("Stuart").closest("tr");

        expect(within(row).getByText("Amanda")).toBeInTheDocument();
        expect(within(row).getByText("Stuart")).toBeInTheDocument();
        expect(within(row).getByText("Guest")).toBeInTheDocument();
        expect(
            within(row).getByText(
                "Catamaran & Snorkeling, Sunset Dinner Cruise",
            ),
        ).toBeInTheDocument();
    });

    it("shows only activities whose type is Excursion", () => {
        renderReport();

        const row = screen.getByText("Henderson").closest("tr");

        expect(
            within(row).getByText(
                "Island Jeep Tour, Catamaran & Snorkeling",
            ),
        ).toBeInTheDocument();

        expect(
            within(row).queryByText("Welcome Dinner"),
        ).not.toBeInTheDocument();
    });

    it("shows None when a traveler has no excursions", () => {
        renderReport();

        const row = screen.getByText("Reynolds").closest("tr");

        expect(within(row).getByText("None")).toBeInTheDocument();
    });

    it("shows the empty state and hides report actions when no registrations exist", () => {
        renderReport("2");

        expect(
            screen.getByText(
                "No excursion information is available for this trip.",
            ),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("button", { name: "Download CSV" }),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole("button", { name: "Print / Save PDF" }),
        ).not.toBeInTheDocument();
    });

    it("downloads the excursion list as CSV", () => {
        const createObjectURL = vi.fn(() => "blob:test-url");
        const revokeObjectURL = vi.fn();

        vi.stubGlobal("URL", {
            createObjectURL,
            revokeObjectURL,
        });

        const clickSpy = vi
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => { });

        renderReport();

        fireEvent.click(
            screen.getByRole("button", { name: "Download CSV" }),
        );

        expect(createObjectURL).toHaveBeenCalledTimes(1);
        expect(clickSpy).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-url");

        const blob = createObjectURL.mock.calls[0][0];

        expect(blob).toBeInstanceOf(Blob);
    });

    it("prints the excursion list", () => {
        const printSpy = vi
            .spyOn(window, "print")
            .mockImplementation(() => { });

        renderReport();

        fireEvent.click(
            screen.getByRole("button", { name: "Print / Save PDF" }),
        );

        expect(printSpy).toHaveBeenCalledTimes(1);
    });
});