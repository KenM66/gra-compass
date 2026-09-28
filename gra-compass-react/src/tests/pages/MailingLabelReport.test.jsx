import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import MailingLabelReport from "../../pages/MailingLabelReport";

const renderReport = (registrationsByTrip) => {
    render(
        <MemoryRouter initialEntries={["/reports/mailing-labels?tripId=1"]}>
            <MailingLabelReport registrationsByTrip={registrationsByTrip} />
        </MemoryRouter>,
    );
};

describe("MailingLabelReport", () => {
    test("displays traveler and guest with the last name only once when they share a last name", () => {
        renderReport({
            1: [
                {
                    firstName: "Mary",
                    lastName: "Jones",
                    address: {
                        street: "12345 Oak Street",
                        city: "Ridgewood",
                        state: "CA",
                        zipCode: "90211",
                    },
                    guest: {
                        firstName: "Josh",
                        lastName: "Jones",
                    },
                },
            ],
        });

        expect(
            screen.getByRole("cell", {
                name: "Mary and Josh Jones",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "12345 Oak Street",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "Ridgewood",
            }),
        ).toBeInTheDocument();
    });
    test("displays both last names when the traveler and guest have different last names", () => {
        renderReport({
            1: [
                {
                    firstName: "Mary",
                    lastName: "Jones",
                    address: {
                        street: "123456 Tree Lawn St",
                        city: "Glendale",
                        state: "CO",
                        zipCode: "80211",
                    },
                    guest: {
                        firstName: "Josh",
                        lastName: "Stuart",
                    },
                },
            ],
        });

        expect(
            screen.getByRole("cell", {
                name: "Mary Jones and Josh Stuart",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "123456 Tree Lawn St",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "Glendale",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "CO",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("cell", {
                name: "80211",
            }),
        ).toBeInTheDocument();
    });
    test("displays only the traveler name when there is no guest", () => {
        renderReport({
            1: [
                {
                    firstName: "Mary",
                    lastName: "Jones",
                    address: {
                        street: "12345 Oak Street",
                        city: "Ridgewood",
                        state: "CA",
                        zipCode: "90211",
                    },
                },
            ],
        });

        expect(
            screen.getByRole("cell", {
                name: "Mary Jones",
            }),
        ).toBeInTheDocument();

        expect(
            screen.queryByText(/and/i),
        ).not.toBeInTheDocument();
    });
    test("shows an empty state and hides the download button when there are no mailing labels", () => {
        renderReport({
            1: [],
        });

        expect(
            screen.getByText("No mailing labels are available for this trip."),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("button", {
                name: "Download CSV",
            }),
        ).not.toBeInTheDocument();
    });
    test("downloads a CSV containing the mailing label data", async () => {
        const user = userEvent.setup();

        const createObjectURL = vi
            .spyOn(URL, "createObjectURL")
            .mockReturnValue("blob:mailing-labels");

        const revokeObjectURL = vi
            .spyOn(URL, "revokeObjectURL")
            .mockImplementation(() => { });

        const click = vi
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => { });

        renderReport({
            1: [
                {
                    firstName: "Mary",
                    lastName: "Jones",
                    address: {
                        street: "12345 Oak Street",
                        city: "Ridgewood",
                        state: "CA",
                        zipCode: "90211",
                    },
                    guest: {
                        firstName: "Josh",
                        lastName: "Jones",
                    },
                },
            ],
        });

        await user.click(
            screen.getByRole("button", {
                name: "Download CSV",
            }),
        );

        expect(createObjectURL).toHaveBeenCalledTimes(1);

        const blob = createObjectURL.mock.calls[0][0];

        expect(blob).toBeInstanceOf(Blob);

        expect(click).toHaveBeenCalledTimes(1);

        expect(revokeObjectURL).toHaveBeenCalledWith(
            "blob:mailing-labels",
        );

        createObjectURL.mockRestore();
        revokeObjectURL.mockRestore();
        click.mockRestore();
    });
    test("properly escapes commas and quotation marks in CSV values", async () => {
        const user = userEvent.setup();

        const originalBlob = globalThis.Blob;

        const blobMock = vi.fn(function (content, options) {
            this.content = content;
            this.options = options;
        });

        globalThis.Blob = blobMock;

        const createObjectURL = vi
            .spyOn(URL, "createObjectURL")
            .mockReturnValue("blob:mailing-labels");

        const revokeObjectURL = vi
            .spyOn(URL, "revokeObjectURL")
            .mockImplementation(() => { });

        const click = vi
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => { });

        renderReport({
            1: [
                {
                    firstName: 'Mary "MJ"',
                    lastName: "Jones",
                    address: {
                        street: "123 Oak Street, Apt 4",
                        city: "Ridgewood",
                        state: "CA",
                        zipCode: "90211",
                    },
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
            '"Mary ""MJ"" Jones","123 Oak Street, Apt 4","Ridgewood","CA","90211"',
        );

        globalThis.Blob = originalBlob;
        createObjectURL.mockRestore();
        revokeObjectURL.mockRestore();
        click.mockRestore();
    });
});