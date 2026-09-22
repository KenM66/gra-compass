import { useNavigate, useSearchParams } from "react-router-dom";
import trips from "../data/mockTrips";
import "../components/DietaryReport.css";

const DietaryReport = ({ registrationsByTrip }) => {
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
      dietaryRequirements: registration.dietaryRequirements || "None",
    };

    if (!registration.bringingGuest || !registration.guest) {
      return [primaryTraveler];
    }

    const guest = {
      key: `guest-${registration.travelerNumber}`,
      travelerNumber: registration.travelerNumber,
      name: `${registration.guest.firstName} ${registration.guest.lastName}`,
      travelerType: "Guest",
      dietaryRequirements: registration.guest.dietaryRestrictions || "None",
    };

    return [primaryTraveler, guest];
  });

  const dietaryTravelers = travelers.filter(
    (traveler) =>
      traveler.dietaryRequirements &&
      traveler.dietaryRequirements.toLowerCase() !== "none",
  );

  const hasValidReport = trip && dietaryTravelers.length > 0;

  return (
    <div className="dietary-report-page">
      <div className="dietary-report-actions">
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
        <div className="dietary-report-empty">
          <h1>No Dietary Restrictions Report Available</h1>

          <p>
            No travelers with dietary restrictions were found for this trip.
          </p>
        </div>
      )}

      {hasValidReport && (
        <>
          <h1>Dietary Restrictions Report</h1>
          <h2>{trip.name}</h2>

          <p className="dietary-report-count">
            {dietaryTravelers.length}{" "}
            {dietaryTravelers.length === 1 ? "traveler" : "travelers"} with
            reported dietary restrictions
          </p>

          <table className="dietary-report-table">
            <thead>
              <tr>
                <th>Traveler #</th>
                <th>Name</th>
                <th>Type</th>
                <th>Dietary Restriction</th>
              </tr>
            </thead>

            <tbody>
              {dietaryTravelers.map((traveler) => (
                <tr key={traveler.key}>
                  <td>{traveler.travelerNumber}</td>
                  <td>{traveler.name}</td>
                  <td>{traveler.travelerType}</td>
                  <td>{traveler.dietaryRequirements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default DietaryReport;
