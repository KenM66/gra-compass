import { useNavigate } from "react-router-dom";
import "./TripCard.css";

const TripCard = ({
  tripId,
  name,
  destination,
  startDate,
  endDate,
  registrationCount,
  imagePreview,
}) => {
  const navigate = useNavigate();

  const handleViewRegistrations = () => {
    navigate(`/trips/${tripId}/registrations`);
  };

  return (
    <div className="trip-card">
      <div className="trip-card-image">
        {imagePreview ? <img src={imagePreview} alt={name} /> : "Trip Image"}
      </div>

      <div className="trip-card-content">
        <h3>{name}</h3>

        <p>{destination}</p>
        <p>
          {startDate} - {endDate}
        </p>

        <p>
          <strong>{registrationCount}</strong> Registrations
        </p>

        <button onClick={handleViewRegistrations}>View Registrations</button>
        <button onClick={() => navigate(`/trips/${tripId}/manage`)}>
          Manage Trip
        </button>
      </div>
    </div>
  );
};

export default TripCard;
