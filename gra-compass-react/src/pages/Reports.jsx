import { useState } from "react";
import trips from "../data/mockTrips";
import ActivitySessionReportBuilder from "../components/ActivitySessionReportBuilder";
import RegistrationReportBuilder from "../components/RegistrationReportBuilder";
import "../styles/Reports.css";
import AccessibilityReportBuilder from "../components/AccessibilityReportBuilder";
import DietaryReportBuilder from "../components/DietaryReportBuilder";
import FlightBookingReportBuilder from "../components/FlightBookingReportBuilder";
import EmailAddressReportBuilder from "../components/EmailAddressReportBuilder";

const Reports = () => {
  const [selectedTripId, setSelectedTripId] = useState("");

  return (
    <div className="reports-page">
      <h1>Reports</h1>

      <div className="reports-trip-selector">
        <label htmlFor="report-trip">Trip</label>

        <select
          id="report-trip"
          value={selectedTripId}
          onChange={(event) => setSelectedTripId(event.target.value)}
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
        <div className="reports-builders">
          <ActivitySessionReportBuilder tripId={selectedTripId} />
          <RegistrationReportBuilder tripId={selectedTripId} />
          <AccessibilityReportBuilder tripId={selectedTripId} />
          <DietaryReportBuilder tripId={selectedTripId} />
          <FlightBookingReportBuilder tripId={selectedTripId} />
          <EmailAddressReportBuilder tripId={selectedTripId} />
        </div>
      )}
    </div>
  );
};

export default Reports;
