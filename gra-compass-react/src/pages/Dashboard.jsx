import TripCard from "../components/TripCard";
import "../components/Dashboard.css";
import trips from "../data/mockTrips";

const Dashboard = () => {
  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <h1>Trips</h1>
        <p>Select a trip to view and manage its registrations.</p>

        <button className="create-trip-button">Create Trip</button>
      </div>

      <section className="trips-section">
        <h2>Upcoming Trips</h2>

        <div className="trip-list">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              tripId={trip.id}
              name={trip.name}
              destination={trip.destination}
              startDate={trip.startDate}
              endDate={trip.endDate}
              registrationCount={trip.registrationCount}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
