import { useNavigate, useSearchParams } from "react-router-dom";
import trips from "../data/mockTrips";
import "../styles/AccessibilityReport.css";

const AccessibilityReport = ({ registrationsByTrip }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tripId = searchParams.get("tripId");

  const trip = trips.find((trip) => trip.id === Number(tripId));
  const registrations = registrationsByTrip[tripId] || [];

  const travelers = registrations.flatMap((registration) => {
    const primaryTraveler = {
      key: `primary-${registration.travelerNumber}`,
      travelerNumber: registration.travelerNumber,
      name: `${registration.firstName} ${registration.lastName}`,
      travelerType: "Primary",
      phone: registration.phone,
      accessibility: registration.accessibility || "None",
    };

    if (!registration.bringingGuest || !registration.guest) {
      return [primaryTraveler];
    }

    const guest = {
      key: `guest-${registration.travelerNumber}`,
      travelerNumber: registration.travelerNumber,
      name: `${registration.guest.firstName} ${registration.guest.lastName}`,
      travelerType: "Guest",
      phone: registration.phone,
      accessibility: registration.guest.accessibility || "None",
    };

    return [primaryTraveler, guest];
  });

  const accessibilityTravelers = travelers.filter(
    (traveler) =>
      traveler.accessibility && traveler.accessibility.toLowerCase() !== "none",
  );

  const hasValidReport = trip && accessibilityTravelers.length > 0;

  return (
    <div className="accessibility-report-page">
      <div className="accessibility-report-actions">
        <button type="button" onClick={() => navigate(-1)}>
          ← Back to Reports
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          disabled={!hasValidReport}
        >
          Print / Save as PDF
        </button>
      </div>

      {!hasValidReport && (
        <div className="accessibility-report-empty">
          <h1>No Accessibility Needs Report Available</h1>

          <p>No travelers with accessibility needs were found for this trip.</p>
        </div>
      )}

      {hasValidReport && (
        <>
          <h1>Accessibility Needs Report</h1>
          <h2>{trip.name}</h2>

          <p className="accessibility-report-count">
            {accessibilityTravelers.length}{" "}
            {accessibilityTravelers.length === 1 ? "traveler" : "travelers"}{" "}
            with reported accessibility needs
          </p>

          <table className="accessibility-report-table">
            <thead>
              <tr>
                <th>Traveler #</th>
                <th>Name</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Accessibility Need</th>
              </tr>
            </thead>

            <tbody>
              {accessibilityTravelers.map((traveler) => (
                <tr key={traveler.key}>
                  <td>{traveler.travelerNumber}</td>
                  <td>{traveler.name}</td>
                  <td>{traveler.travelerType}</td>
                  <td>{traveler.phone}</td>
                  <td>{traveler.accessibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AccessibilityReport;
