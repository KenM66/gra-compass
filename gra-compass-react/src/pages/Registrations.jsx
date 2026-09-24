import { useParams } from "react-router-dom";
import RegistrationList from "../components/RegistrationList";
import "../styles/Registrations.css";
import registrationsByTrip from "../data/mockRegistrations";
import trips from "../data/mockTrips";

const Registrations = () => {
  const { tripId } = useParams();
  const trip = trips.find((trip) => trip.id === Number(tripId));
  const registrations = registrationsByTrip[tripId] || [];

  return (
    <main className="registrations-page">
      <div className="registrations-header">
        <h1>{trip?.name || "Trip Registrations"}</h1>
        <p>{trip?.destination}</p>
      </div>

      <RegistrationList tripId={tripId} registrations={registrations} />
    </main>
  );
};

export default Registrations;
