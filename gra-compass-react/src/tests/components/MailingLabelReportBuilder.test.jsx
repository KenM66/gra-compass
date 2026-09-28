import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    MemoryRouter,
    Route,
    Routes,
} from "react-router-dom";
import { describe, expect, test } from "vitest";
import MailingLabelReportBuilder from "../../components/MailingLabelReportBuilder";

describe("MailingLabelReportBuilder", () => {
    test("opens the builder and navigates to the mailing labels report", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/reports"]}>
                <Routes>
                    <Route
                        path="/reports"
                        element={<MailingLabelReportBuilder tripId="1" />}
                    />

                    <Route
                        path="/reports/mailing-labels"
                        element={<div>Mailing Labels Destination</div>}
                    />
                </Routes>
            </MemoryRouter>,
        );

        await user.click(
            screen.getByRole("button", {
                name: /Mailing Labels/,
            }),
        );

        expect(
            screen.getByText(
                "Generate mailing names and addresses for this trip for export to Avery.",
            ),
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", {
                name: "Generate Report",
            }),
        );

        expect(
            screen.getByText("Mailing Labels Destination"),
        ).toBeInTheDocument();
    });
});