import { useNavigate, useSearchParams } from "react-router-dom";
import trips from "../data/mockTrips";
import "../components/FlightBookingReport.css";

const FlightBookingReport = ({ registrationsByTrip }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tripId = searchParams.get("tripId");

  const trip = trips.find((trip) => trip.id === Number(tripId));
  const registrations = registrationsByTrip[tripId] || [];

  const travelers = registrations.flatMap((registration) => {
    const primaryTraveler = {
      key: `primary-${registration.travelerNumber}`,
      travelerNumber: registration.travelerNumber,
      travelerType: "Primary",
      firstName: registration.firstName,
      lastName: registration.lastName,
      airport: registration.airport,
      dateOfBirth: registration.dateOfBirth,
      sex: registration.sex,
      nationality: registration.nationality,
      citizenship: registration.citizenship,
      passportNumber: registration.passportNumber,
      passportExpiration: registration.passportExpiration,
      tsaPrecheck: registration.tsaPrecheck,
      accessibility: registration.accessibility,
      dietaryRequirements: registration.dietaryRequirements,
    };

    if (!registration.bringingGuest || !registration.guest) {
      return [primaryTraveler];
    }

    const guest = {
      key: `guest-${registration.travelerNumber}`,
      travelerNumber: registration.travelerNumber,
      travelerType: "Guest",
      firstName: registration.guest.firstName,
      lastName: registration.guest.lastName,
      airport: registration.guest.airport,
      dateOfBirth: registration.guest.dateOfBirth,
      sex: registration.guest.sex,
      nationality: registration.guest.nationality,
      citizenship: registration.guest.citizenship,
      passportNumber: registration.guest.passportNumber,
      passportExpiration: registration.guest.passportExpiration,
      tsaPrecheck: registration.guest.tsaPrecheck,
      accessibility: registration.guest.accessibility,
      dietaryRequirements: registration.guest.dietaryRequirements,
    };

    return [primaryTraveler, guest];
  });

  const flightBookingTravelers = travelers.filter(
    (traveler) => traveler.airport,
  );

  const hasValidReport = trip && flightBookingTravelers.length > 0;

  return (
    <div className="flight-booking-report-page">
      <div className="flight-booking-report-actions">
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
        <div className="flight-booking-report-empty">
          <h1>No Flight Booking Report Available</h1>

          <p>
            No travelers requiring GRA flight booking were found for this trip.
          </p>
        </div>
      )}

      {hasValidReport && (
        <>
          <h1>Flight Booking Report</h1>
          <h2>{trip.name}</h2>

          <p className="flight-booking-report-count">
            {flightBookingTravelers.length}{" "}
            {flightBookingTravelers.length === 1 ? "traveler" : "travelers"}{" "}
            requiring flight booking
          </p>

          <table className="flight-booking-report-table">
            <thead>
              <tr>
                <th>Airport</th>
                <th>Type</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>DOB</th>
                <th>Sex</th>
                <th>Nationality</th>
                <th>Citizenship</th>
                <th>Passport Number</th>
                <th>Passport Expiration</th>
                <th>TSA PreCheck</th>
                <th>Accommodations</th>
                <th>Dietary</th>
              </tr>
            </thead>

            <tbody>
              {flightBookingTravelers.map((traveler) => (
                <tr key={traveler.key}>
                  <td>{traveler.airport}</td>
                  <td>{traveler.travelerType}</td>
                  <td>{traveler.firstName}</td>
                  <td>{traveler.lastName}</td>
                  <td>{traveler.dateOfBirth}</td>
                  <td>{traveler.sex}</td>
                  <td>{traveler.nationality}</td>
                  <td>{traveler.citizenship}</td>
                  <td>{traveler.passportNumber || "N/A"}</td>
                  <td>{traveler.passportExpiration || "N/A"}</td>
                  <td>{traveler.tsaPrecheck ? "Yes" : "No"}</td>
                  <td>{traveler.accessibility || "None"}</td>
                  <td>{traveler.dietaryRequirements || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default FlightBookingReport;
