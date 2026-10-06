import { useSearchParams } from "react-router-dom";
import "../styles/NameTagReport.css";

const NameTagReport = ({ registrationsByTrip }) => {
    const [searchParams] = useSearchParams();
    const tripId = searchParams.get("tripId");

    const tripRegistrations = registrationsByTrip[tripId] ?? [];

    const nameTagRows = tripRegistrations.flatMap((registration) => {
        const travelerRow = {
            firstName:
                registration.preferredName?.trim() ||
                registration.firstName?.trim() ||
                "",
            lastName: registration.lastName?.trim() ?? "",
            role: registration.role?.trim() ?? "",
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
        ];

        const rows = nameTagRows.map((row) => [
            row.firstName,
            row.lastName,
            row.role,
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
        link.download = `name-tag-list-trip-${tripId}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        window.print();
    };
    return (
        <main className="name-tag-report">
            <h1>Name Tag List</h1>
            {nameTagRows.length > 0 && (
                <div className="name-tag-actions">
                    <button type="button" onClick={handleDownloadCsv}>
                        Download CSV
                    </button>

                    <button type="button" onClick={handlePrint}>
                        Print / Save PDF
                    </button>
                </div>
            )}

            {nameTagRows.length === 0 ? (
                <p>No name tag information is available for this trip.</p>
            ) : (
                <table className="name-tag-grid">
                    <thead>
                        <tr>
                            <th>First / Preferred Name</th>
                            <th>Last Name</th>
                            <th>Role</th>
                        </tr>
                    </thead>

                    <tbody>
                        {nameTagRows.map((row, index) => (
                            <tr key={index}>
                                <td>{row.firstName}</td>
                                <td>{row.lastName}</td>
                                <td>{row.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
};

export default NameTagReport;