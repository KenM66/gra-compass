import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchRegistrationsByTrip } from "../store/registrationsSlice";
import "../styles/RegistrationReport.css";

const RegistrationReport = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const tripId = searchParams.get("tripId");

  const trip = useSelector((state) =>
    state.trips.items.find((trip) => trip.id === tripId),
  );

  const registrations = useSelector(
    (state) => state.registrations.byTrip[tripId] || [],
  );

  useEffect(() => {
    if (tripId) {
      dispatch(fetchRegistrationsByTrip(tripId));
    }
  }, [dispatch, tripId]);

  const hasValidReport = trip && registrations.length > 0;

  return (
    <div className="registration-report-page">
      <div className="registration-report-actions">
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
        <div className="registration-report-empty">
          <h1>No Report Available</h1>
          <p>No registrations were found for the selected trip.</p>
        </div>
      )}

      {hasValidReport && (
        <>
          <h1>Registration Report</h1>
          <h2>{trip.name}</h2>

          <p className="registration-report-count">
            {registrations.length}{" "}
            {registrations.length === 1 ? "registration" : "registrations"}
          </p>

          <table className="registration-report-table">
            <thead>
              <tr>
                <th>Traveler #</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Bringing Guest</th>
                <th>Guest Name</th>
              </tr>
            </thead>

            <tbody>
              {registrations.map((registration) => (
                <tr key={registration.travelerNumber}>
                  <td>{registration.travelerNumber}</td>

                  <td>
                    {registration.firstName} {registration.lastName}
                  </td>

                  <td>{registration.email}</td>

                  <td>{registration.phone}</td>

                  <td>{registration.bringingGuest ? "Yes" : "No"}</td>

                  <td>
                    {registration.bringingGuest && registration.guest
                      ? `${registration.guest.firstName} ${registration.guest.lastName}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default RegistrationReport;
