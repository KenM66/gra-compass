import { useState } from "react";
import RegistrationCard from "./RegistrationCard";

const RegistrationList = ({ tripId, registrations }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRegistrations = registrations.filter((registration) => {
    const search = searchTerm.toLowerCase();

    return (
      registration.travelerNumber.toString().includes(search) ||
      `${registration.firstName} ${registration.lastName}`
        .toLowerCase()
        .includes(search) ||
      registration.email.toLowerCase().includes(search)
    );
  });

  return (
    <>
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
    </>
  );
};

export default RegistrationList;
