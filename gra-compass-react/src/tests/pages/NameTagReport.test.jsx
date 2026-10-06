import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import NameTagReport from "../../pages/NameTagReport";

const renderReport = (registrationsByTrip) => {
    render(
        <MemoryRouter initialEntries={["/reports/name-tags?tripId=1"]}>
            <NameTagReport registrationsByTrip={registrationsByTrip} />
        </MemoryRouter>,
    );
};

describe("NameTagReport", () => {
    test("uses the preferred name when one is available", () => {
        renderReport({
            1: [
                {
                    firstName: "Robert",
                    preferredName: "Rob",
                    lastName: "Henderson",
                    role: "Regional Manager",
                },
            ],
        });

        expect(
            screen.getByRole("cell", {
                name: "Rob",
            }),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("cell", {
                name: "Robert",
            }),
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "Henderson",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "Regional Manager",
            }),
        ).toBeInTheDocument();
    });

    test("uses the first name when there is no preferred name", () => {
        renderReport({
            1: [
                {
                    firstName: "Amanda",
                    lastName: "Reynolds",
                    role: "Sales Representative",
                },
            ],
        });

        expect(
            screen.getByRole("cell", {
                name: "Amanda",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "Reynolds",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "Sales Representative",
            }),
        ).toBeInTheDocument();
    });

    test("displays the traveler and guest as separate rows and labels the guest role as Guest", () => {
        renderReport({
            1: [
                {
                    firstName: "Robert",
                    preferredName: "Rob",
                    lastName: "Henderson",
                    role: "Director",
                    guest: {
                        firstName: "Amanda",
                        lastName: "Stuart",
                        role: "This Should Not Display",
                    },
                },
            ],
        });

        expect(
            screen.getByRole("cell", {
                name: "Rob",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "Amanda",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "Director",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "Guest",
            }),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("cell", {
                name: "This Should Not Display",
            }),
        ).not.toBeInTheDocument();
    });

    test("uses a guest preferred name when one is available", () => {
        renderReport({
            1: [
                {
                    firstName: "Robert",
                    lastName: "Henderson",
                    role: "Executive",
                    guest: {
                        firstName: "Elizabeth",
                        preferredName: "Liz",
                        lastName: "Henderson",
                    },
                },
            ],
        });

        expect(
            screen.getByRole("cell", {
                name: "Liz",
            }),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("cell", {
                name: "Elizabeth",
            }),
        ).not.toBeInTheDocument();
    });

    test("shows an empty state and hides report actions when there are no name tags", () => {
        renderReport({
            1: [],
        });

        expect(
            screen.getByText(
                "No name tag information is available for this trip.",
            ),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("button", {
                name: "Download CSV",
            }),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole("button", {
                name: "Print / Save PDF",
            }),
        ).not.toBeInTheDocument();
    });

    test("downloads a CSV containing the name tag data", async () => {
        const user = userEvent.setup();

        const originalBlob = globalThis.Blob;

        const blobMock = vi.fn(function (content, options) {
            this.content = content;
            this.options = options;
        });

        globalThis.Blob = blobMock;

        const createObjectURL = vi
            .spyOn(URL, "createObjectURL")
            .mockReturnValue("blob:name-tags");

        const revokeObjectURL = vi
            .spyOn(URL, "revokeObjectURL")
            .mockImplementation(() => { });

        const click = vi
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => { });

        renderReport({
            1: [
                {
                    firstName: 'Robert "Bob"',
                    lastName: "Henderson, Jr.",
                    role: "Regional Manager",
                },
            ],
        });

        await user.click(
            screen.getByRole("button", {
                name: "Download CSV",
            }),
        );

        expect(blobMock).toHaveBeenCalledTimes(1);

        const csvContent = blobMock.mock.calls[0][0][0];

        expect(csvContent).toContain(
            '"First / Preferred Name","Last Name","Role"',
        );

        expect(csvContent).toContain(
            '"Robert ""Bob""","Henderson, Jr.","Regional Manager"',
        );

        expect(click).toHaveBeenCalledTimes(1);

        expect(revokeObjectURL).toHaveBeenCalledWith(
            "blob:name-tags",
        );

        globalThis.Blob = originalBlob;
        createObjectURL.mockRestore();
        revokeObjectURL.mockRestore();
        click.mockRestore();
    });

    test("opens the browser print dialog", async () => {
        const user = userEvent.setup();

        const print = vi
            .spyOn(window, "print")
            .mockImplementation(() => { });

        renderReport({
            1: [
                {
                    firstName: "Robert",
                    lastName: "Henderson",
                    role: "Director",
                },
            ],
        });

        await user.click(
            screen.getByRole("button", {
                name: "Print / Save PDF",
            }),
        );

        expect(print).toHaveBeenCalledTimes(1);

        print.mockRestore();
    });
});