import { useParams } from "react-router-dom";
import "../components/RegistrationDetails.css";
import registrationsByTrip from "../data/mockRegistrations";
import { useState } from "react";

const RegistrationDetails = () => {
  const { tripId, id } = useParams();

  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);

  const registrations = registrationsByTrip[tripId] || [];

  const registration = registrations.find(
    (registration) => registration.travelerNumber === Number(id),
  );

  return (
    <main className="registration-details-page">
      <div className="details-header">
        <div>
          <p className="traveler-number">
            Traveler #{registration.travelerNumber}
          </p>

          <h1>
            {registration.firstName} {registration.lastName}
          </h1>

          <p>{registration.email}</p>
        </div>
      </div>

      <div className="details-grid">
        <section className="details-section">
          <div className="details-section-header">
            <h2>Personal Information</h2>

            <button
              type="button"
              onClick={() => setIsEditingPersonalInfo(true)}
            >
              Edit
            </button>
          </div>

          <div className="detail-row">
            <span>First Name</span>
            <strong>{registration.firstName}</strong>
          </div>

          <div className="detail-row">
            <span>Last Name</span>
            <strong>{registration.lastName}</strong>
          </div>

          <div className="detail-row">
            <span>Email</span>
            <strong>{registration.email}</strong>
          </div>

          <div className="detail-row">
            <span>Phone</span>
            <strong>{registration.phone}</strong>
          </div>

          <div className="detail-row">
            <span>Date of Birth</span>
            <strong>{registration.dateOfBirth}</strong>
          </div>
        </section>

        <section className="details-section">
          <h2>Travel Information</h2>

          <div className="detail-row">
            <span>TSA PreCheck</span>
            <strong>{registration.tsaPrecheck ? "Yes" : "No"}</strong>
          </div>

          <div className="detail-row">
            <span>Passport Number</span>
            <strong>{registration.passportNumber}</strong>
          </div>

          <div className="detail-row">
            <span>Passport Expiration</span>
            <strong>{registration.passportExpiration}</strong>
          </div>
        </section>

        <section className="details-section">
          <h2>Guest Information</h2>

          <div className="detail-row">
            <span>Bringing Guest</span>
            <strong>{registration.bringingGuest ? "Yes" : "No"}</strong>
          </div>

          {registration.bringingGuest && (
            <>
              <div className="detail-row">
                <span>Guest Name</span>
                <strong>
                  {registration.guest.firstName} {registration.guest.lastName}
                </strong>
              </div>

              <div className="detail-row">
                <span>Guest Email</span>
                <strong>{registration.guest.email}</strong>
              </div>
            </>
          )}
        </section>

        <section className="details-section">
          <h2>Emergency Contact</h2>

          <div className="detail-row">
            <span>Name</span>
            <strong>{registration.emergencyContact.name}</strong>
          </div>

          <div className="detail-row">
            <span>Relationship</span>
            <strong>{registration.emergencyContact.relationship}</strong>
          </div>

          <div className="detail-row">
            <span>Phone</span>
            <strong>{registration.emergencyContact.phone}</strong>
          </div>
        </section>
        <section className="details-section">
          <h2>Address</h2>

          <div className="detail-row">
            <span>Street</span>
            <strong>{registration.address.street}</strong>
          </div>

          <div className="detail-row">
            <span>City</span>
            <strong>{registration.address.city}</strong>
          </div>

          <div className="detail-row">
            <span>State</span>
            <strong>{registration.address.state}</strong>
          </div>

          <div className="detail-row">
            <span>ZIP Code</span>
            <strong>{registration.address.zipCode}</strong>
          </div>
        </section>

        <section className="details-section">
          <h2>Special Requirements</h2>

          <div className="detail-row">
            <span>Accessibility</span>
            <strong>{registration.accessibility}</strong>
          </div>

          <div className="detail-row">
            <span>Dietary Requirements</span>
            <strong>{registration.dietaryRequirements}</strong>
          </div>
        </section>
        <section className="details-section">
          <h2>Trip Selections</h2>

          {registration.activities.length > 0 ? (
            registration.activities.map((activity) => (
              <div className="detail-row" key={activity.id}>
                <span>{activity.type}</span>
                <strong>{activity.name}</strong>
              </div>
            ))
          ) : (
            <p>No trip selections.</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default RegistrationDetails;
