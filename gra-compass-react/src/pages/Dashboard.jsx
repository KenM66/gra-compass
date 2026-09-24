import TripCard from "../components/TripCard";
import "../styles/Dashboard.css";
import { useState } from "react";

import { useNavigate } from "react-router-dom";

const Dashboard = ({ trips, registrationsByTrip }) => {
  const navigate = useNavigate();
  const [showArchivedTrips, setShowArchivedTrips] = useState(false);

  const visibleTrips = trips.filter((trip) => {
    if (showArchivedTrips) {
      return true;
    }

    const tripEndDate = new Date(trip.endDate);
    tripEndDate.setHours(23, 59, 59, 999);
    return tripEndDate >= new Date();
  });

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <h1>Trips</h1>
        <p>Select a trip to view and manage its registrations.</p>

        <button
          className="create-trip-button"
          onClick={() => navigate("/trips/create")}
        >
          Create Trip
        </button>
      </div>

      <section className="trips-section">
        <div className="trips-section-header">
          <h2>Upcoming Trips</h2>

          <label className="archived-trips-toggle">
            <input
              type="checkbox"
              checked={showArchivedTrips}
              onChange={(event) => setShowArchivedTrips(event.target.checked)}
            />
            Show archived trips
          </label>
        </div>

        <div className="trip-list">
          {visibleTrips.map((trip) => {
            const registrations = registrationsByTrip[trip.id] || [];

            const registrationCount = registrations.length;

            const travelerCount = registrations.reduce(
              (total, registration) =>
                total +
                1 +
                (registration.bringingGuest && registration.guest ? 1 : 0),
              0,
            );

            return (
              <TripCard
                key={trip.id}
                tripId={trip.id}
                name={trip.name}
                destination={trip.destination}
                startDate={trip.startDate}
                endDate={trip.endDate}
                registrationCount={registrationCount}
                travelerCount={travelerCount}
                imagePreview={trip.imagePreview}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
