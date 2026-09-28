import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    MemoryRouter,
    Route,
    Routes,
} from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import CreateTrip from "../../pages/CreateTrip";

const renderCreateTrip = ({
    setTrips = vi.fn(),
} = {}) => {
    render(
        <MemoryRouter>
            <CreateTrip setTrips={setTrips} />
        </MemoryRouter>,
    );

    return { setTrips };
};

describe("CreateTrip", () => {
    test("displays the create trip form", () => {
        renderCreateTrip();

        expect(
            screen.getByRole("heading", {
                name: "Create Trip",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Trip Name"),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Destination"),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Start Date"),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("End Date"),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Trip Image"),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Create Trip",
            }),
        ).toBeInTheDocument();
    });
    test("requires the trip name, destination, start date, and end date", async () => {
        const user = userEvent.setup();
        const setTrips = vi.fn();
        const alertSpy = vi
            .spyOn(window, "alert")
            .mockImplementation(() => { });

        renderCreateTrip({
            setTrips,
        });

        await user.click(
            screen.getByRole("button", {
                name: "Create Trip",
            }),
        );

        expect(alertSpy).toHaveBeenCalledWith(
            "Trip name, destination, start date, and end date are required.",
        );

        expect(setTrips).not.toHaveBeenCalled();

        alertSpy.mockRestore();
    });
    test("does not create a trip when the end date is before the start date", async () => {
        const user = userEvent.setup();
        const setTrips = vi.fn();
        const alertSpy = vi
            .spyOn(window, "alert")
            .mockImplementation(() => { });

        renderCreateTrip({
            setTrips,
        });

        await user.type(
            screen.getByLabelText("Trip Name"),
            "Cancún Adventure",
        );

        await user.type(
            screen.getByLabelText("Destination"),
            "Cancún, Mexico",
        );

        await user.type(
            screen.getByLabelText("Start Date"),
            "2027-03-10",
        );

        await user.type(
            screen.getByLabelText("End Date"),
            "2027-03-09",
        );

        await user.click(
            screen.getByRole("button", {
                name: "Create Trip",
            }),
        );

        expect(alertSpy).toHaveBeenCalledWith(
            "End date cannot be before the start date.",
        );

        expect(setTrips).not.toHaveBeenCalled();

        alertSpy.mockRestore();
    });
    test("creates a new trip with the entered information", async () => {
        const user = userEvent.setup();
        const setTrips = vi.fn();

        const dateNowSpy = vi
            .spyOn(Date, "now")
            .mockReturnValue(123456789);

        renderCreateTrip({
            setTrips,
        });

        await user.type(
            screen.getByLabelText("Trip Name"),
            "Cancún Adventure",
        );

        await user.type(
            screen.getByLabelText("Destination"),
            "Cancún, Mexico",
        );

        await user.type(
            screen.getByLabelText("Start Date"),
            "2027-03-08",
        );

        await user.type(
            screen.getByLabelText("End Date"),
            "2027-03-13",
        );

        await user.click(
            screen.getByRole("button", {
                name: "Create Trip",
            }),
        );

        expect(setTrips).toHaveBeenCalledTimes(1);

        const updateTrips = setTrips.mock.calls[0][0];

        const existingTrips = [
            {
                id: 1,
                name: "Existing Trip",
            },
        ];

        expect(updateTrips(existingTrips)).toEqual([
            ...existingTrips,
            {
                id: 123456789,
                name: "Cancún Adventure",
                destination: "Cancún, Mexico",
                startDate: "2027-03-08",
                endDate: "2027-03-13",
                registrationCount: 0,
                registrationCapacity: 0,
                travelerCapacity: 0,
                registrationCloseDate: "",
                imagePreview: "",
            },
        ]);

        dateNowSpy.mockRestore();
    });
    test("trims whitespace from the trip name and destination", async () => {
        const user = userEvent.setup();
        const setTrips = vi.fn();

        renderCreateTrip({
            setTrips,
        });

        await user.type(
            screen.getByLabelText("Trip Name"),
            "   Cancún Adventure   ",
        );

        await user.type(
            screen.getByLabelText("Destination"),
            "   Cancún, Mexico   ",
        );

        await user.type(
            screen.getByLabelText("Start Date"),
            "2027-03-08",
        );

        await user.type(
            screen.getByLabelText("End Date"),
            "2027-03-13",
        );

        await user.click(
            screen.getByRole("button", {
                name: "Create Trip",
            }),
        );

        const updateTrips = setTrips.mock.calls[0][0];
        const updatedTrips = updateTrips([]);

        expect(updatedTrips[0].name).toBe(
            "Cancún Adventure",
        );

        expect(updatedTrips[0].destination).toBe(
            "Cancún, Mexico",
        );
    });
    test("displays a preview when a trip image is selected", async () => {
        const user = userEvent.setup();

        const createObjectURLSpy = vi
            .spyOn(URL, "createObjectURL")
            .mockReturnValue("blob:trip-preview");

        renderCreateTrip();

        const imageFile = new File(
            ["trip image"],
            "cancun.jpg",
            {
                type: "image/jpeg",
            },
        );

        await user.upload(
            screen.getByLabelText("Trip Image"),
            imageFile,
        );

        expect(createObjectURLSpy).toHaveBeenCalledWith(
            imageFile,
        );

        expect(
            screen.getByRole("img", {
                name: "Trip preview",
            }),
        ).toHaveAttribute(
            "src",
            "blob:trip-preview",
        );

        createObjectURLSpy.mockRestore();
    });
    test("navigates to the dashboard after successfully creating a trip", async () => {
        const user = userEvent.setup();
        const setTrips = vi.fn();

        render(
            <MemoryRouter initialEntries={["/trips/create"]}>
                <Routes>
                    <Route
                        path="/trips/create"
                        element={<CreateTrip setTrips={setTrips} />}
                    />
                    <Route
                        path="/"
                        element={<div>Dashboard Destination</div>}
                    />
                </Routes>
            </MemoryRouter>,
        );

        await user.type(
            screen.getByLabelText("Trip Name"),
            "Cancún Adventure",
        );

        await user.type(
            screen.getByLabelText("Destination"),
            "Cancún, Mexico",
        );

        await user.type(
            screen.getByLabelText("Start Date"),
            "2027-03-08",
        );

        await user.type(
            screen.getByLabelText("End Date"),
            "2027-03-13",
        );

        await user.click(
            screen.getByRole("button", {
                name: "Create Trip",
            }),
        );

        expect(
            screen.getByText("Dashboard Destination"),
        ).toBeInTheDocument();
    });
});