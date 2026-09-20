import { useNavigate, useSearchParams } from "react-router-dom";
import trips from "../data/mockTrips";
import selectionsByTrip from "../data/mockTripSelections";
import "../components/ActivitySessionReport.css";

const ActivitySessionReport = ({ registrationsByTrip }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tripId = searchParams.get("tripId");
  const sessionIds = (searchParams.get("sessionIds") || "")
    .split(",")
    .filter(Boolean)
    .map(Number);

  const trip = trips.find((trip) => trip.id === Number(tripId));

  const tripSelections = selectionsByTrip[tripId] || [];
  const tripRegistrations = registrationsByTrip[tripId] || [];

  const reportSessions = tripSelections
    .flatMap((selection) =>
      selection.sessions.map((session) => ({
        ...session,
        selectionName: selection.name,
        selectionType: selection.type,
      })),
    )
    .filter((session) => sessionIds.includes(session.id))
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`),
    );

  const hasValidReport =
    trip && sessionIds.length > 0 && reportSessions.length > 0;

  const getSessionAttendees = (sessionId) => {
    return tripRegistrations.filter((registration) =>
      registration.activities?.some(
        (activity) => activity.sessionId === sessionId,
      ),
    );
  };

  return (
    <div className="activity-report-page">
      <div className="activity-report-actions">
        <button type="button" onClick={() => navigate(-1)}>
          ← Back to Reports
        </button>

        <button type="button" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>

      {!hasValidReport && (
        <div className="activity-report-empty">
          <h1>No Report Available</h1>
          <p>
            Select a trip and at least one activity session to generate a
            report.
          </p>
        </div>
      )}
      {hasValidReport && (
        <>
          <h1>Activity Session Report</h1>

          {trip && <h2>{trip.name}</h2>}

          {reportSessions.map((session) => (
            <section key={session.id} className="activity-report-session">
              <h3>{session.selectionName}</h3>

              <p>
                {new Date(`${session.date}T${session.time}`).toLocaleString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  },
                )}
              </p>

              <p>
                {getSessionAttendees(session.id).length} attendees ·{" "}
                {session.maxCapacity} capacity
              </p>
              <div>
                <h4>Attendees</h4>

                {getSessionAttendees(session.id).length > 0 ? (
                  <table className="activity-report-attendees">
                    <thead>
                      <tr>
                        <th className="check-in-column">✓</th>
                        <th>Traveler #</th>
                        <th>Name</th>
                      </tr>
                    </thead>

                    <tbody>
                      {getSessionAttendees(session.id).map((registration) => (
                        <tr key={registration.travelerNumber}>
                          <td className="check-in-column">
                            <span className="check-in-box"></span>
                          </td>
                          <td>{registration.travelerNumber}</td>
                          <td>
                            {registration.firstName} {registration.lastName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No attendees found in current registration data.</p>
                )}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
};

export default ActivitySessionReport;
