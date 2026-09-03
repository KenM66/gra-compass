import { useState } from "react";
import { useParams } from "react-router-dom";
import RegistrationCard from "../components/RegistrationCard";
import "../components/Registrations.css";
import registrationsByTrip from "../data/mockRegistrations";
import trips from "../data/mockTrips";

const Registrations = () => {
  const { tripId } = useParams();
  const trip = trips.find((trip) => trip.id === Number(tripId));
  const [searchTerm, setSearchTerm] = useState("");

  const registrations = registrationsByTrip[tripId] || [];

  const filteredRegistrations = registrations.filter((registration) => {
    const search = searchTerm.toLowerCase();

    return (
      registration.travelerNumber.toString().includes(search) ||
      registration.name.toLowerCase().includes(search) ||
      registration.email.toLowerCase().includes(search)
    );
  });

  return (
    <main className="registrations-page">
      <div className="registrations-header">
        <h1>{trip?.name || "Trip Registrations"}</h1>
        <p>{trip?.destination}</p>
      </div>

      <div className="registration-search">
        <input
          type="text"
          placeholder="Search traveler #, name, or email..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="registration-list">
        {filteredRegistrations.length > 0 ? (
          filteredRegistrations.map((registration) => (
            <RegistrationCard
              key={registration.travelerNumber}
              tripId={tripId}
              travelerNumber={registration.travelerNumber}
              name={`${registration.firstName} ${registration.lastName}`}
              email={registration.email}
              bringingGuest={registration.bringingGuest}
            />
          ))
        ) : (
          <p className="no-results">No registrations found.</p>
        )}
      </div>
    </main>
  );
};

export default Registrations;
