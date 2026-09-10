import { useParams } from "react-router-dom";
import registrationsByTrip from "../data/mockRegistrations";
import "../components/RegistrationDetails.css";

const GuestDetails = () => {
  const { tripId, id } = useParams();

  const registrations = registrationsByTrip[tripId] || [];

  const registration = registrations.find(
    (registration) => registration.travelerNumber === Number(id),
  );

  const guest = registration?.guest;

  if (!registration) {
    return (
      <main className="registration-details-page">
        <h1>Registration Not Found</h1>
      </main>
    );
  }

  if (!guest) {
    return (
      <main className="registration-details-page">
        <h1>Guest Information</h1>
        <p>No guest information is currently available.</p>
      </main>
    );
  }

  return (
    <main className="registration-details-page">
      <div className="guest-details-header">
        <div>
          <h1>Guest Information</h1>
          <p>Guest of Traveler #{registration.travelerNumber}</p>
        </div>
      </div>

      <section className="details-section">
        <div className="details-section-header">
          <h2>Personal Information</h2>

          <button type="button">Edit</button>
        </div>

        <div className="detail-row">
          <span>First Name</span>
          <strong>{guest.firstName}</strong>
        </div>

        <div className="detail-row">
          <span>Last Name</span>
          <strong>{guest.lastName}</strong>
        </div>

        <div className="detail-row">
          <span>Email</span>
          <strong>{guest.email}</strong>
        </div>

        <div className="detail-row">
          <span>Phone</span>
          <strong>{guest.phone || "Not Provided"}</strong>
        </div>

        <div className="detail-row">
          <span>Date of Birth</span>
          <strong>{guest.dateOfBirth || "Not Provided"}</strong>
        </div>
      </section>

      <section className="details-section">
        <div className="details-section-header">
          <h2>Travel Information</h2>

          <button type="button">Edit</button>
        </div>

        <div className="detail-row">
          <span>Passport Number</span>
          <strong>{guest.passportNumber || "Not Provided"}</strong>
        </div>

        <div className="detail-row">
          <span>Passport Expiration</span>
          <strong>{guest.passportExpiration || "Not Provided"}</strong>
        </div>
      </section>

      <section className="details-section">
        <div className="details-section-header">
          <h2>Accessibility & Dietary</h2>

          <button type="button">Edit</button>
        </div>

        <div className="detail-row">
          <span>Accessibility</span>
          <strong>{guest.accessibility || "None"}</strong>
        </div>

        <div className="detail-row">
          <span>Dietary Restrictions</span>
          <strong>{guest.dietaryRestrictions || "None"}</strong>
        </div>
      </section>
    </main>
  );
};

export default GuestDetails;
