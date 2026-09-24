import { useNavigate } from "react-router-dom";
import "../styles/TripCard.css";

const TripCard = ({
  tripId,
  name,
  destination,
  startDate,
  endDate,
  registrationCount,
  travelerCount,
  imagePreview,
}) => {
  const navigate = useNavigate();
  const formatDateForDisplay = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
          {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
        </p>

        <p>
          <strong>{registrationCount}</strong>{" "}
          {registrationCount === 1 ? "Registration" : "Registrations"}
          {" • "}
          <strong>{travelerCount}</strong>{" "}
          {travelerCount === 1 ? "Traveler" : "Travelers"}
        </p>
        <button onClick={() => navigate(`/trips/${tripId}/manage`)}>
          Manage Trip
        </button>
      </div>
    </div>
  );
};

export default TripCard;
