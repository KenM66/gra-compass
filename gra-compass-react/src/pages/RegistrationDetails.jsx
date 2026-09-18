import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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

  const [isEditingTravelInfo, setIsEditingTravelInfo] = useState(false);

  const [editTravelInfo, setEditTravelInfo] = useState({
    tsaPrecheck: false,
    passportNumber: "",
    passportExpiration: "",
  });

  const [isEditingEmergencyContact, setIsEditingEmergencyContact] =
    useState(false);

  const [editEmergencyContact, setEditEmergencyContact] = useState({
    name: "",
    relationship: "",
    phone: "",
  });

  const [isEditingSpecialRequirements, setIsEditingSpecialRequirements] =
    useState(false);

  const [editSpecialRequirements, setEditSpecialRequirements] = useState({
    accessibility: "",
    dietaryRequirements: "",
  });

  const registrations = registrationsByTrip[tripId] || [];

  const registration = registrations.find(
    (registration) => registration.travelerNumber === Number(id),
  );

  const hasGuest = registration?.bringingGuest ?? false;
  const guestInfo = registration?.guest ?? null;

  const handleSavePersonalInfo = () => {
    setRegistrationsByTrip((currentRegistrations) => ({
      ...currentRegistrations,
      [tripId]: currentRegistrations[tripId].map((currentRegistration) =>
        currentRegistration.travelerNumber === Number(id)
          ? {
              ...currentRegistration,
              ...editPersonalInfo,
            }
          : currentRegistration,
      ),
    }));

    setIsEditingPersonalInfo(false);
  };

  const handleSaveAddress = () => {
    setRegistrationsByTrip((currentRegistrations) => ({
      ...currentRegistrations,
      [tripId]: currentRegistrations[tripId].map((currentRegistration) =>
        currentRegistration.travelerNumber === Number(id)
          ? {
              ...currentRegistration,
              address: {
                ...currentRegistration.address,
                ...editAddress,
              },
            }
          : currentRegistration,
      ),
    }));

    setIsEditingAddress(false);
  };

  return (
    <main className="registration-details-page">
      <button
        type="button"
        className="back-to-registrations-button"
        onClick={() => navigate(`/trips/${tripId}/manage?tab=registrations`)}
      >
        ← Back to Registrations
      </button>

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
                  firstName: registration.firstName || "",
                  lastName: registration.lastName || "",
                  email: registration.email || "",
                  phone: registration.phone || "",
                  dateOfBirth: registration.dateOfBirth || "",
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
              <strong>{registration.firstName || ""}</strong>
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
              <strong>{registration.lastName || ""}</strong>
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
              <strong>{registration.email || ""}</strong>
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
              <strong>{registration.phone || ""}</strong>
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
              <strong>{registration.dateOfBirth || ""}</strong>
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
                    firstName: registration.firstName || "",
                    lastName: registration.lastName || "",
                    email: registration.email || "",
                    phone: registration.phone || "",
                    dateOfBirth: registration.dateOfBirth || "",
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
                  tsaPrecheck: registration.tsaPrecheck ?? false,
                  passportNumber: registration.passportNumber || "",
                  passportExpiration: registration.passportExpiration || "",
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
              <strong>{registration.tsaPrecheck ? "Yes" : "No"}</strong>
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
              <strong>{registration.passportNumber}</strong>
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
              <strong>{registration.passportExpiration}</strong>
            )}
          </div>
          {isEditingTravelInfo && (
            <div className="travel-info-edit-actions">
              <button
                type="button"
                onClick={() => {
                  setRegistrationsByTrip((currentRegistrations) => ({
                    ...currentRegistrations,
                    [tripId]: currentRegistrations[tripId].map(
                      (currentRegistration) =>
                        currentRegistration.travelerNumber === Number(id)
                          ? {
                              ...currentRegistration,
                              ...editTravelInfo,
                            }
                          : currentRegistration,
                    ),
                  }));

                  setIsEditingTravelInfo(false);
                }}
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditTravelInfo({
                    tsaPrecheck: registration.tsaPrecheck ?? false,
                    passportNumber: registration.passportNumber || "",
                    passportExpiration: registration.passportExpiration || "",
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
          <div className="details-section-header">
            <h2>Emergency Contact</h2>

            <button
              type="button"
              onClick={() => {
                setEditEmergencyContact({
                  name: registration.emergencyContact.name || "",
                  relationship:
                    registration.emergencyContact.relationship || "",
                  phone: registration.emergencyContact.phone || "",
                });

                setIsEditingEmergencyContact(true);
              }}
            >
              Edit
            </button>
          </div>

          <div className="detail-row">
            <span>Name</span>
            {isEditingEmergencyContact ? (
              <input
                type="text"
                value={editEmergencyContact.name}
                onChange={(event) =>
                  setEditEmergencyContact({
                    ...editEmergencyContact,
                    name: event.target.value,
                  })
                }
              />
            ) : (
              <strong>{registration.emergencyContact.name}</strong>
            )}
          </div>

          <div className="detail-row">
            <span>Relationship</span>
            {isEditingEmergencyContact ? (
              <input
                type="text"
                value={editEmergencyContact.relationship}
                onChange={(event) =>
                  setEditEmergencyContact({
                    ...editEmergencyContact,
                    relationship: event.target.value,
                  })
                }
              />
            ) : (
              <strong>{registration.emergencyContact.relationship}</strong>
            )}
          </div>

          <div className="detail-row">
            <span>Phone</span>
            {isEditingEmergencyContact ? (
              <input
                type="text"
                value={editEmergencyContact.phone}
                onChange={(event) =>
                  setEditEmergencyContact({
                    ...editEmergencyContact,
                    phone: event.target.value,
                  })
                }
              />
            ) : (
              <strong>{registration.emergencyContact.phone}</strong>
            )}
          </div>

          {isEditingEmergencyContact && (
            <div className="edit-actions">
              <button
                type="button"
                onClick={() => {
                  setRegistrationsByTrip((currentRegistrations) => ({
                    ...currentRegistrations,
                    [tripId]: currentRegistrations[tripId].map(
                      (currentRegistration) =>
                        currentRegistration.travelerNumber === Number(id)
                          ? {
                              ...currentRegistration,
                              emergencyContact: {
                                ...currentRegistration.emergencyContact,
                                ...editEmergencyContact,
                              },
                            }
                          : currentRegistration,
                    ),
                  }));

                  setIsEditingEmergencyContact(false);
                }}
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditEmergencyContact({
                    name: registration.emergencyContact.name || "",
                    relationship:
                      registration.emergencyContact.relationship || "",
                    phone: registration.emergencyContact.phone || "",
                  });

                  setIsEditingEmergencyContact(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </section>
        <section className="details-section">
          <div className="details-section-header">
            <h2>Address</h2>

            <button
              type="button"
              onClick={() => {
                setEditAddress({
                  street: registration.address.street || "",
                  city: registration.address.city || "",
                  state: registration.address.state || "",
                  zipCode: registration.address.zipCode || "",
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
              <strong>{registration.address.street}</strong>
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
              <strong>{registration.address.city}</strong>
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
              <strong>{registration.address.state}</strong>
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
              <strong>{registration.address.zipCode}</strong>
            )}
          </div>
          {isEditingAddress && (
            <div className="address-edit-actions">
              <button type="button" onClick={handleSaveAddress}>
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditAddress({
                    street: registration.address.street || "",
                    city: registration.address.city || "",
                    state: registration.address.state || "",
                    zipCode: registration.address.zipCode || "",
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
          <div className="details-section-header">
            <h2>Special Requirements</h2>

            <button
              type="button"
              onClick={() => {
                setEditSpecialRequirements({
                  accessibility: registration.accessibility || "",
                  dietaryRequirements: registration.dietaryRequirements || "",
                });

                setIsEditingSpecialRequirements(true);
              }}
            >
              Edit
            </button>
          </div>

          <div className="detail-row">
            <span>Accessibility</span>
            {isEditingSpecialRequirements ? (
              <input
                type="text"
                value={editSpecialRequirements.accessibility}
                onChange={(event) =>
                  setEditSpecialRequirements({
                    ...editSpecialRequirements,
                    accessibility: event.target.value,
                  })
                }
              />
            ) : (
              <strong>{registration.accessibility}</strong>
            )}
          </div>

          <div className="detail-row">
            <span>Dietary Requirements</span>
            {isEditingSpecialRequirements ? (
              <input
                type="text"
                value={editSpecialRequirements.dietaryRequirements}
                onChange={(event) =>
                  setEditSpecialRequirements({
                    ...editSpecialRequirements,
                    dietaryRequirements: event.target.value,
                  })
                }
              />
            ) : (
              <strong>{registration.dietaryRequirements}</strong>
            )}
          </div>
          {isEditingSpecialRequirements && (
            <div className="edit-actions">
              <button
                type="button"
                onClick={() => {
                  setRegistrationsByTrip((currentRegistrations) => ({
                    ...currentRegistrations,
                    [tripId]: currentRegistrations[tripId].map(
                      (currentRegistration) =>
                        currentRegistration.travelerNumber === Number(id)
                          ? {
                              ...currentRegistration,
                              ...editSpecialRequirements,
                            }
                          : currentRegistration,
                    ),
                  }));

                  setIsEditingSpecialRequirements(false);
                }}
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditSpecialRequirements({
                    accessibility: registration.accessibility || "",
                    dietaryRequirements: registration.dietaryRequirements || "",
                  });

                  setIsEditingSpecialRequirements(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}
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
