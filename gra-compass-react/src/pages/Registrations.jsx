import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import RegistrationList from "../components/RegistrationList";
import { fetchRegistrationsByTrip } from "../store/registrationsSlice";
import "../styles/Registrations.css";

const Registrations = () => {
  const { tripId } = useParams();
  const dispatch = useDispatch();

  const trip = useSelector((state) =>
    state.trips.items.find((trip) => trip.id === tripId),
  );

  const registrations = useSelector(
    (state) => state.registrations.byTrip[tripId] || [],
  );

  useEffect(() => {
    dispatch(fetchRegistrationsByTrip(tripId));
  }, [dispatch, tripId]);

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
