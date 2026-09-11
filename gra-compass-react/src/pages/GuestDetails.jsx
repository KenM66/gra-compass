import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "../components/RegistrationDetails.css";

const GuestDetails = ({ registrationsByTrip, setRegistrationsByTrip }) => {
  const { tripId, id } = useParams();
  const navigate = useNavigate();
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);

  const [editPersonalInfo, setEditPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  const [isEditingTravelInfo, setIsEditingTravelInfo] = useState(false);

  const [editTravelInfo, setEditTravelInfo] = useState({
    passportNumber: "",
    passportExpiration: "",
  });

  const [isEditingAccessibilityDietary, setIsEditingAccessibilityDietary] =
    useState(false);

  const [editAccessibilityDietary, setEditAccessibilityDietary] = useState({
    accessibility: "",
    dietaryRestrictions: "",
  });

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
  const handleSavePersonalInfo = () => {
    setRegistrationsByTrip((currentRegistrations) => ({
      ...currentRegistrations,
      [tripId]: currentRegistrations[tripId].map((currentRegistration) =>
        currentRegistration.travelerNumber === Number(id)
          ? {
              ...currentRegistration,
              guest: {
                ...currentRegistration.guest,
                ...editPersonalInfo,
              },
            }
          : currentRegistration,
      ),
    }));

    setIsEditingPersonalInfo(false);
  };

  const handleCancelPersonalInfo = () => {
    setEditPersonalInfo({
      firstName: guest.firstName || "",
      lastName: guest.lastName || "",
      email: guest.email || "",
      phone: guest.phone || "",
      dateOfBirth: guest.dateOfBirth || "",
    });

    setIsEditingPersonalInfo(false);
  };

  const handleSaveTravelInfo = () => {
    setRegistrationsByTrip((currentRegistrations) => ({
      ...currentRegistrations,
      [tripId]: currentRegistrations[tripId].map((currentRegistration) =>
        currentRegistration.travelerNumber === Number(id)
          ? {
              ...currentRegistration,
              guest: {
                ...currentRegistration.guest,
                ...editTravelInfo,
              },
            }
          : currentRegistration,
      ),
    }));

    setIsEditingTravelInfo(false);
  };

  const handleCancelTravelInfo = () => {
    setEditTravelInfo({
      passportNumber: guest.passportNumber || "",
      passportExpiration: guest.passportExpiration || "",
    });

    setIsEditingTravelInfo(false);
  };

  const handleSaveAccessibilityDietary = () => {
    setRegistrationsByTrip((currentRegistrations) => ({
      ...currentRegistrations,
      [tripId]: currentRegistrations[tripId].map((currentRegistration) =>
        currentRegistration.travelerNumber === Number(id)
          ? {
              ...currentRegistration,
              guest: {
                ...currentRegistration.guest,
                ...editAccessibilityDietary,
              },
            }
          : currentRegistration,
      ),
    }));

    setIsEditingAccessibilityDietary(false);
  };

  const handleCancelAccessibilityDietary = () => {
    setEditAccessibilityDietary({
      accessibility: guest.accessibility || "",
      dietaryRestrictions: guest.dietaryRestrictions || "",
    });

    setIsEditingAccessibilityDietary(false);
  };

  return (
    <main className="registration-details-page">
      <div className="guest-details-header">
        <div>
          <h1>Guest Information</h1>
          <p>Guest of Traveler #{registration.travelerNumber}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/trips/${tripId}/registrations/${id}`)}
        >
          Back to Traveler
        </button>
      </div>

      <section className="details-section">
        <div className="details-section-header">
          <h2>Personal Information</h2>

          <button
            type="button"
            onClick={() => {
              setEditPersonalInfo({
                firstName: guest.firstName || "",
                lastName: guest.lastName || "",
                email: guest.email || "",
                phone: guest.phone || "",
                dateOfBirth: guest.dateOfBirth || "",
              });

              setIsEditingPersonalInfo(true);
            }}
          >
            Edit
          </button>
        </div>

        <div className="detail-row">
          <span>First Name</span>

          {isEditingPersonalInfo ? (
            <input
              type="text"
              value={editPersonalInfo.firstName}
              onChange={(event) =>
                setEditPersonalInfo({
                  ...editPersonalInfo,
                  firstName: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.firstName || "Not Provided"}</strong>
          )}
        </div>

        <div className="detail-row">
          <span>Last Name</span>

          {isEditingPersonalInfo ? (
            <input
              type="text"
              value={editPersonalInfo.lastName}
              onChange={(event) =>
                setEditPersonalInfo({
                  ...editPersonalInfo,
                  lastName: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.lastName || "Not Provided"}</strong>
          )}
        </div>

        <div className="detail-row">
          <span>Email</span>

          {isEditingPersonalInfo ? (
            <input
              type="email"
              value={editPersonalInfo.email}
              onChange={(event) =>
                setEditPersonalInfo({
                  ...editPersonalInfo,
                  email: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.email || "Not Provided"}</strong>
          )}
        </div>

        <div className="detail-row">
          <span>Phone</span>

          {isEditingPersonalInfo ? (
            <input
              type="text"
              value={editPersonalInfo.phone}
              onChange={(event) =>
                setEditPersonalInfo({
                  ...editPersonalInfo,
                  phone: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.phone || "Not Provided"}</strong>
          )}
        </div>

        <div className="detail-row">
          <span>Date of Birth</span>

          {isEditingPersonalInfo ? (
            <input
              type="date"
              value={editPersonalInfo.dateOfBirth}
              onChange={(event) =>
                setEditPersonalInfo({
                  ...editPersonalInfo,
                  dateOfBirth: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.dateOfBirth || "Not Provided"}</strong>
          )}
        </div>
        {isEditingPersonalInfo && (
          <div className="edit-actions">
            <button type="button" onClick={handleSavePersonalInfo}>
              Save
            </button>

            <button type="button" onClick={handleCancelPersonalInfo}>
              Cancel
            </button>
          </div>
        )}
      </section>

      <section className="details-section">
        <div className="details-section-header">
          <h2>Travel Information</h2>

          <button
            type="button"
            onClick={() => {
              setEditTravelInfo({
                passportNumber: guest.passportNumber || "",
                passportExpiration: guest.passportExpiration || "",
              });

              setIsEditingTravelInfo(true);
            }}
          >
            Edit
          </button>
        </div>

        <div className="detail-row">
          <span>Passport Number</span>

          {isEditingTravelInfo ? (
            <input
              type="text"
              value={editTravelInfo.passportNumber}
              onChange={(event) =>
                setEditTravelInfo({
                  ...editTravelInfo,
                  passportNumber: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.passportNumber || "Not Provided"}</strong>
          )}
        </div>

        <div className="detail-row">
          <span>Passport Expiration</span>

          {isEditingTravelInfo ? (
            <input
              type="date"
              value={editTravelInfo.passportExpiration}
              onChange={(event) =>
                setEditTravelInfo({
                  ...editTravelInfo,
                  passportExpiration: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.passportExpiration || "Not Provided"}</strong>
          )}
        </div>
        {isEditingTravelInfo && (
          <div className="edit-actions">
            <button type="button" onClick={handleSaveTravelInfo}>
              Save
            </button>

            <button type="button" onClick={handleCancelTravelInfo}>
              Cancel
            </button>
          </div>
        )}
      </section>

      <section className="details-section">
        <div className="details-section-header">
          <h2>Accessibility & Dietary</h2>

          <button
            type="button"
            onClick={() => {
              setEditAccessibilityDietary({
                accessibility: guest.accessibility || "",
                dietaryRestrictions: guest.dietaryRestrictions || "",
              });

              setIsEditingAccessibilityDietary(true);
            }}
          >
            Edit
          </button>
        </div>

        <div className="detail-row">
          <span>Accessibility</span>

          {isEditingAccessibilityDietary ? (
            <input
              type="text"
              value={editAccessibilityDietary.accessibility}
              onChange={(event) =>
                setEditAccessibilityDietary({
                  ...editAccessibilityDietary,
                  accessibility: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.accessibility || "None"}</strong>
          )}
        </div>

        <div className="detail-row">
          <span>Dietary Restrictions</span>

          {isEditingAccessibilityDietary ? (
            <input
              type="text"
              value={editAccessibilityDietary.dietaryRestrictions}
              onChange={(event) =>
                setEditAccessibilityDietary({
                  ...editAccessibilityDietary,
                  dietaryRestrictions: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.dietaryRestrictions || "None"}</strong>
          )}
        </div>
        {isEditingAccessibilityDietary && (
          <div className="edit-actions">
            <button type="button" onClick={handleSaveAccessibilityDietary}>
              Save
            </button>

            <button type="button" onClick={handleCancelAccessibilityDietary}>
              Cancel
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default GuestDetails;
