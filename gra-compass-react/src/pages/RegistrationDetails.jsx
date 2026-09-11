import { useParams, useNavigate } from "react-router-dom";
import "../components/RegistrationDetails.css";

import { useState } from "react";

const RegistrationDetails = ({
  registrationsByTrip,
  setRegistrationsByTrip,
}) => {
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
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [editAddress, setEditAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [savedAddress, setSavedAddress] = useState(null);

  const [isEditingTravelInfo, setIsEditingTravelInfo] = useState(false);

  const [editTravelInfo, setEditTravelInfo] = useState({
    tsaPrecheck: false,
    passportNumber: "",
    passportExpiration: "",
  });

  const [savedTravelInfo, setSavedTravelInfo] = useState(null);

  const registrations = registrationsByTrip[tripId] || [];

  const registration = registrations.find(
    (registration) => registration.travelerNumber === Number(id),
  );

  const hasGuest = registration?.bringingGuest ?? false;
  const guestInfo = registration?.guest ?? null;

  const [savedPersonalInfo, setSavedPersonalInfo] = useState(null);

  const handleSavePersonalInfo = () => {
    setSavedPersonalInfo({
      ...editPersonalInfo,
    });

    setIsEditingPersonalInfo(false);
  };

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
              onClick={() => {
                setEditPersonalInfo({
                  firstName:
                    savedPersonalInfo?.firstName ?? registration.firstName,
                  lastName:
                    savedPersonalInfo?.lastName ?? registration.lastName,
                  email: savedPersonalInfo?.email ?? registration.email,
                  phone: savedPersonalInfo?.phone ?? registration.phone,
                  dateOfBirth:
                    savedPersonalInfo?.dateOfBirth ?? registration.dateOfBirth,
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
              <strong>
                {savedPersonalInfo?.firstName ?? registration.firstName}
              </strong>
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
              <strong>
                {savedPersonalInfo?.lastName ?? registration.lastName}
              </strong>
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
              <strong>{savedPersonalInfo?.email ?? registration.email}</strong>
            )}
          </div>

          <div className="detail-row">
            <span>Phone</span>

            {isEditingPersonalInfo ? (
              <input
                type="tel"
                value={editPersonalInfo.phone}
                onChange={(event) =>
                  setEditPersonalInfo({
                    ...editPersonalInfo,
                    phone: event.target.value,
                  })
                }
              />
            ) : (
              <strong>{savedPersonalInfo?.phone ?? registration.phone}</strong>
            )}
          </div>

          <div className="detail-row">
            <span>Date of Birth</span>

            {isEditingPersonalInfo ? (
              <input
                type="text"
                value={editPersonalInfo.dateOfBirth}
                onChange={(event) =>
                  setEditPersonalInfo({
                    ...editPersonalInfo,
                    dateOfBirth: event.target.value,
                  })
                }
              />
            ) : (
              <strong>
                {savedPersonalInfo?.dateOfBirth ?? registration.dateOfBirth}
              </strong>
            )}
          </div>
          {isEditingPersonalInfo && (
            <div className="personal-info-edit-actions">
              <button type="button" onClick={handleSavePersonalInfo}>
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditPersonalInfo({
                    firstName:
                      savedPersonalInfo?.firstName ?? registration.firstName,
                    lastName:
                      savedPersonalInfo?.lastName ?? registration.lastName,
                    email: savedPersonalInfo?.email ?? registration.email,
                    phone: savedPersonalInfo?.phone ?? registration.phone,
                    dateOfBirth:
                      savedPersonalInfo?.dateOfBirth ??
                      registration.dateOfBirth,
                  });

                  setIsEditingPersonalInfo(false);
                }}
              >
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
                  tsaPrecheck:
                    savedTravelInfo?.tsaPrecheck ?? registration.tsaPrecheck,
                  passportNumber:
                    savedTravelInfo?.passportNumber ??
                    registration.passportNumber,
                  passportExpiration:
                    savedTravelInfo?.passportExpiration ??
                    registration.passportExpiration,
                });

                setIsEditingTravelInfo(true);
              }}
            >
              Edit
            </button>
          </div>

          <div className="detail-row">
            <span>TSA PreCheck</span>

            {isEditingTravelInfo ? (
              <button
                type="button"
                className={`yes-no-toggle ${
                  editTravelInfo.tsaPrecheck ? "yes" : "no"
                }`}
                onClick={() =>
                  setEditTravelInfo({
                    ...editTravelInfo,
                    tsaPrecheck: !editTravelInfo.tsaPrecheck,
                  })
                }
              >
                {editTravelInfo.tsaPrecheck ? "Yes" : "No"}
              </button>
            ) : (
              <strong>
                {(savedTravelInfo?.tsaPrecheck ?? registration.tsaPrecheck)
                  ? "Yes"
                  : "No"}
              </strong>
            )}
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
              <strong>
                {savedTravelInfo?.passportNumber ?? registration.passportNumber}
              </strong>
            )}
          </div>

          <div className="detail-row">
            <span>Passport Expiration</span>

            {isEditingTravelInfo ? (
              <input
                type="text"
                value={editTravelInfo.passportExpiration}
                onChange={(event) =>
                  setEditTravelInfo({
                    ...editTravelInfo,
                    passportExpiration: event.target.value,
                  })
                }
              />
            ) : (
              <strong>
                {savedTravelInfo?.passportExpiration ??
                  registration.passportExpiration}
              </strong>
            )}
          </div>
          {isEditingTravelInfo && (
            <div className="travel-info-edit-actions">
              <button
                type="button"
                onClick={() => {
                  setSavedTravelInfo({
                    ...editTravelInfo,
                  });

                  setIsEditingTravelInfo(false);
                }}
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditTravelInfo({
                    tsaPrecheck:
                      savedTravelInfo?.tsaPrecheck ?? registration.tsaPrecheck,
                    passportNumber:
                      savedTravelInfo?.passportNumber ??
                      registration.passportNumber,
                    passportExpiration:
                      savedTravelInfo?.passportExpiration ??
                      registration.passportExpiration,
                  });

                  setIsEditingTravelInfo(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </section>

        <section className="details-section">
          <h2>Guest Information</h2>

          <div className="detail-row">
            <span>Bringing Guest</span>

            <button
              type="button"
              className={`guest-toggle ${hasGuest ? "yes" : "no"}`}
              onClick={() => {
                if (hasGuest) {
                  const confirmed = window.confirm(
                    "Are you sure you want to remove this guest? All guest information for this traveler will be deleted and cannot be undone.",
                  );

                  if (!confirmed) {
                    return;
                  }

                  setRegistrationsByTrip((currentRegistrations) => ({
                    ...currentRegistrations,
                    [tripId]: currentRegistrations[tripId].map(
                      (currentRegistration) =>
                        currentRegistration.travelerNumber === Number(id)
                          ? {
                              ...currentRegistration,
                              bringingGuest: false,
                              guest: null,
                            }
                          : currentRegistration,
                    ),
                  }));

                  return;
                }

                setRegistrationsByTrip((currentRegistrations) => ({
                  ...currentRegistrations,
                  [tripId]: currentRegistrations[tripId].map(
                    (currentRegistration) =>
                      currentRegistration.travelerNumber === Number(id)
                        ? {
                            ...currentRegistration,
                            bringingGuest: true,
                            guest: {
                              firstName: "",
                              lastName: "",
                              email: "",
                              phone: "",
                              dateOfBirth: "",
                              passportNumber: "",
                              passportExpiration: "",
                              accessibility: "",
                              dietaryRestrictions: "",
                            },
                          }
                        : currentRegistration,
                  ),
                }));
              }}
            >
              <span className="guest-toggle-label">
                {hasGuest ? "Yes" : "No"}
              </span>

              <span className="guest-toggle-track">
                <span className="guest-toggle-thumb" />
              </span>
            </button>
          </div>

          {hasGuest && guestInfo && (
            <>
              <div className="detail-row">
                <span>Guest Name</span>
                <strong>
                  {guestInfo.firstName} {guestInfo.lastName}
                </strong>
              </div>

              <div className="detail-row">
                <span>Guest Email</span>
                <strong>{guestInfo.email}</strong>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(`/trips/${tripId}/registrations/${id}/guest`)
                }
              >
                View Guest Information
              </button>
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
          <div className="details-section-header">
            <h2>Address</h2>

            <button
              type="button"
              onClick={() => {
                setEditAddress({
                  street: savedAddress?.street ?? registration.address.street,
                  city: savedAddress?.city ?? registration.address.city,
                  state: savedAddress?.state ?? registration.address.state,
                  zipCode:
                    savedAddress?.zipCode ?? registration.address.zipCode,
                });

                setIsEditingAddress(true);
              }}
            >
              Edit
            </button>
          </div>

          <div className="detail-row">
            <span>Street</span>

            {isEditingAddress ? (
              <input
                type="text"
                value={editAddress.street}
                onChange={(event) =>
                  setEditAddress({
                    ...editAddress,
                    street: event.target.value,
                  })
                }
              />
            ) : (
              <strong>
                {savedAddress?.street ?? registration.address.street}
              </strong>
            )}
          </div>

          <div className="detail-row">
            <span>City</span>

            {isEditingAddress ? (
              <input
                type="text"
                value={editAddress.city}
                onChange={(event) =>
                  setEditAddress({
                    ...editAddress,
                    city: event.target.value,
                  })
                }
              />
            ) : (
              <strong>{savedAddress?.city ?? registration.address.city}</strong>
            )}
          </div>

          <div className="detail-row">
            <span>State</span>

            {isEditingAddress ? (
              <input
                type="text"
                value={editAddress.state}
                onChange={(event) =>
                  setEditAddress({
                    ...editAddress,
                    state: event.target.value,
                  })
                }
              />
            ) : (
              <strong>
                {savedAddress?.state ?? registration.address.state}
              </strong>
            )}
          </div>

          <div className="detail-row">
            <span>ZIP Code</span>

            {isEditingAddress ? (
              <input
                type="text"
                value={editAddress.zipCode}
                onChange={(event) =>
                  setEditAddress({
                    ...editAddress,
                    zipCode: event.target.value,
                  })
                }
              />
            ) : (
              <strong>
                {savedAddress?.zipCode ?? registration.address.zipCode}
              </strong>
            )}
          </div>
          {isEditingAddress && (
            <div className="address-edit-actions">
              <button
                type="button"
                onClick={() => {
                  setSavedAddress({
                    ...editAddress,
                  });

                  setIsEditingAddress(false);
                }}
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditAddress({
                    street: savedAddress?.street ?? registration.address.street,
                    city: savedAddress?.city ?? registration.address.city,
                    state: savedAddress?.state ?? registration.address.state,
                    zipCode:
                      savedAddress?.zipCode ?? registration.address.zipCode,
                  });

                  setIsEditingAddress(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}
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
