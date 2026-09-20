import { useState } from "react";
import { useNavigate } from "react-router-dom";
import trips from "../data/mockTrips";
import selectionsByTrip from "../data/mockTripSelections";
import "../components/Reports.css";

const Reports = () => {
  const navigate = useNavigate();

  const [selectedTripId, setSelectedTripId] = useState("");
  const [selectedSessionIds, setSelectedSessionIds] = useState([]);

  const handleGenerateReport = () => {
    const sessionIds = selectedSessionIds.join(",");

    navigate(
      `/reports/activity-sessions?tripId=${selectedTripId}&sessionIds=${sessionIds}`,
    );
  };

  const handleSessionToggle = (sessionId) => {
    setSelectedSessionIds((currentSessionIds) =>
      currentSessionIds.includes(sessionId)
        ? currentSessionIds.filter((id) => id !== sessionId)
        : [...currentSessionIds, sessionId],
    );
  };

  const handleSelectAll = () => {
    setSelectedSessionIds(sessions.map((session) => session.id));
  };

  const handleClearAll = () => {
    setSelectedSessionIds([]);
  };

  const selectedTripSelections = selectionsByTrip[selectedTripId] || [];

  const sessions = selectedTripSelections
    .flatMap((selection) =>
      selection.sessions.map((session) => ({
        ...session,
        selectionId: selection.id,
        selectionName: selection.name,
        selectionType: selection.type,
      })),
    )
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`),
    );
  const sessionsByDate = sessions.reduce((groups, session) => {
    if (!groups[session.date]) {
      groups[session.date] = [];
    }

    groups[session.date].push(session);

    return groups;
  }, {});
  return (
    <div className="reports-page">
      <div className="reports-trip-selector">
        <label htmlFor="report-trip">Trip</label>

        <select
          id="report-trip"
          value={selectedTripId}
          onChange={(event) => {
            setSelectedTripId(event.target.value);
            setSelectedSessionIds([]);
          }}
        >
          <option value="">Select a trip...</option>

          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.name}
            </option>
          ))}
        </select>
      </div>
      {selectedTripId && (
        <div className="reports-schedule">
          <h2>Activity Session Schedule</h2>
          <div className="reports-actions">
            <button type="button" onClick={handleSelectAll}>
              Select All
            </button>

            <button type="button" onClick={handleClearAll}>
              Clear All
            </button>

            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={selectedSessionIds.length === 0}
            >
              Generate Report
            </button>
          </div>

          {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
            <section key={date} className="reports-date-group">
              <h3>
                {new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>

              {dateSessions.map((session) => (
                <div key={session.id} className="reports-session">
                  <label className="reports-session-label">
                    <input
                      type="checkbox"
                      checked={selectedSessionIds.includes(session.id)}
                      onChange={() => handleSessionToggle(session.id)}
                    />

                    <strong>{session.selectionName}</strong>
                    <span>
                      {" — "}
                      {new Date(
                        `${session.date}T${session.time}`,
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </label>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
