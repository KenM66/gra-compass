import { useSearchParams } from "react-router-dom";

const MailingLabelReport = ({ registrationsByTrip }) => {
    const [searchParams] = useSearchParams();
    const tripId = searchParams.get("tripId");

    const tripRegistrations = registrationsByTrip[tripId] ?? [];

    const getMailingName = (registration) => {
        const travelerFirstName = registration.firstName?.trim() ?? "";
        const travelerLastName = registration.lastName?.trim() ?? "";
        const guest = registration.guest;

        if (!guest) {
            return `${travelerFirstName} ${travelerLastName}`.trim();
        }

        const guestFirstName = guest.firstName?.trim() ?? "";
        const guestLastName = guest.lastName?.trim() ?? "";

        const sameLastName =
            travelerLastName.toLowerCase() === guestLastName.toLowerCase();

        if (sameLastName) {
            return `${travelerFirstName} and ${guestFirstName} ${travelerLastName}`;
        }

        return `${travelerFirstName} ${travelerLastName} and ${guestFirstName} ${guestLastName}`;
    };

    const mailingLabels = tripRegistrations.map((registration) => ({
        name: getMailingName(registration),
        street: registration.address?.street ?? "",
        city: registration.address?.city ?? "",
        state: registration.address?.state ?? "",
        zipCode: registration.address?.zipCode ?? "",
    }));

    const escapeCsvValue = (value) => {
        const stringValue = String(value ?? "");

        return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const handleDownloadCsv = () => {
        const headers = ["Recipient", "Street", "City", "State", "ZIP"];

        const rows = mailingLabels.map((label) => [
            label.name,
            label.street,
            label.city,
            label.state,
            label.zipCode,
        ]);

        const csvContent = [
            headers.map(escapeCsvValue).join(","),
            ...rows.map((row) => row.map(escapeCsvValue).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `mailing-labels-trip-${tripId}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    return (
        <main>
            <h1>Mailing Labels</h1>
            {mailingLabels.length > 0 && (
                <button type="button" onClick={handleDownloadCsv}>
                    Download CSV
                </button>
            )}

            {mailingLabels.length === 0 ? (
                <p>No mailing labels are available for this trip.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Recipient</th>
                            <th>Street</th>
                            <th>City</th>
                            <th>State</th>
                            <th>ZIP</th>
                        </tr>
                    </thead>

                    <tbody>
                        {mailingLabels.map((label, index) => (
                            <tr key={index}>
                                <td>{label.name}</td>
                                <td>{label.street}</td>
                                <td>{label.city}</td>
                                <td>{label.state}</td>
                                <td>{label.zipCode}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
};

export default MailingLabelReport;