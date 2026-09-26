import { useNavigate } from "react-router-dom";
import "../styles/RegistrationCard.css";

const RegistrationCard = ({
  tripId,
  travelerNumber,
  name,
  email,
  bringingGuest,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trips/${tripId}/registrations/${travelerNumber}`);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="registration-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <h3>Traveler #{travelerNumber}</h3>

      <p className="traveler-name">{name}</p>
      <p className="traveler-email">{email}</p>

      <p>
        Bringing Guest: <strong>{bringingGuest ? "Yes" : "No"}</strong>
      </p>
    </div>
  );
};

export default RegistrationCard;
