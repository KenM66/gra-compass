import "../styles/ExcursionListReport.css";
import { useSearchParams } from "react-router-dom";

const ExcursionListReport = ({ registrationsByTrip }) => {
    const [searchParams] = useSearchParams();
    const tripId = searchParams.get("tripId");

    const tripRegistrations = registrationsByTrip[tripId] ?? [];

    const getExcursions = (activities = []) =>
        activities
            .filter((activity) => activity.type === "Excursion")
            .map((activity) => activity.name);

    const reportRows = tripRegistrations.flatMap((registration) => {
        const travelerRow = {
            firstName:
                registration.preferredName?.trim() ||
                registration.firstName?.trim() ||
                "",
            lastName: registration.lastName?.trim() ?? "",
            role: registration.role?.trim() ?? "",
            excursions: getExcursions(registration.activities),
        };

        if (!registration.guest) {
            return [travelerRow];
        }

        const guestRow = {
            firstName:
                registration.guest.preferredName?.trim() ||
                registration.guest.firstName?.trim() ||
                "",
            lastName: registration.guest.lastName?.trim() ?? "",
            role: "Guest",
            excursions: getExcursions(registration.guest.activities),
        };

        return [travelerRow, guestRow];
    });

    const escapeCsvValue = (value) => {
        const stringValue = String(value ?? "");
        return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const handleDownloadCsv = () => {
        const headers = [
            "First / Preferred Name",
            "Last Name",
            "Role",
            "Excursions",
        ];

        const rows = reportRows.map((row) => [
            row.firstName,
            row.lastName,
            row.role,
            row.excursions.join("; "),
        ]);

        const csvContent = [
            headers.map(escapeCsvValue).join(","),
            ...rows.map((row) =>
                row.map(escapeCsvValue).join(","),
            ),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `excursion-list-trip-${tripId}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        window.print();
    };


    return (
        <main className="excursion-list-report">
            <h1>Excursion List by Traveler</h1>
            {reportRows.length > 0 && (
                <div className="excursion-list-actions">
                    <button type="button" onClick={handleDownloadCsv}>
                        Download CSV
                    </button>

                    <button type="button" onClick={handlePrint}>
                        Print / Save PDF
                    </button>
                </div>
            )}

            {reportRows.length === 0 ? (
                <p>No excursion information is available for this trip.</p>
            ) : (
                <table className="excursion-list-grid">
                    <thead>
                        <tr>
                            <th>First / Preferred Name</th>
                            <th>Last Name</th>
                            <th>Role</th>
                            <th>Excursions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {reportRows.map((row, index) => (
                            <tr key={index}>
                                <td>{row.firstName}</td>
                                <td>{row.lastName}</td>
                                <td>{row.role}</td>
                                <td>
                                    {row.excursions.length > 0
                                        ? row.excursions.join(", ")
                                        : "None"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
};

export default ExcursionListReport;