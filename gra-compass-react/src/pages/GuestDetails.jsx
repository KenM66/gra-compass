import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "../styles/RegistrationDetails.css";
import selectionsByTrip from "../data/mockTripSelections";

const GuestDetails = ({ registrationsByTrip, setRegistrationsByTrip }) => {
  const { tripId, id } = useParams();
  const navigate = useNavigate();
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);

  const [editPersonalInfo, setEditPersonalInfo] = useState({
    firstName: "",
    preferredName: "",
    lastName: "",
    sex: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  const [isEditingTravelInfo, setIsEditingTravelInfo] = useState(false);

  const [editTravelInfo, setEditTravelInfo] = useState({
    departureAirport: "",
    passportNumber: "",
    passportExpiration: "",
    passportIssuingCountry: "",
    nationality: "",
    citizenship: "",
  });

  const [isEditingAccessibilityDietary, setIsEditingAccessibilityDietary] =
    useState(false);

  const [editAccessibilityDietary, setEditAccessibilityDietary] = useState({
    accessibility: "",
    dietaryRestrictions: "",
  });

  const [isEditingSelections, setIsEditingSelections] = useState(false);
  const [editSelections, setEditSelections] = useState([]);

  const registrations = registrationsByTrip[tripId] || [];

  const registration = registrations.find(
    (registration) => registration.travelerNumber === Number(id),
  );

  const guest = registration?.guest;
  const availableSelections = selectionsByTrip[tripId] ?? [];
  const getSessionRegistrationCount = (sessionId) =>
    (registrationsByTrip[tripId] ?? []).reduce((count, currentRegistration) => {
      const primaryCount = (currentRegistration.activities ?? []).some(
        (activity) => activity.sessionId === sessionId,
      )
        ? 1
        : 0;

      const guestCount = (currentRegistration.guest?.activities ?? []).some(
        (activity) => activity.sessionId === sessionId,
      )
        ? 1
        : 0;

      return count + primaryCount + guestCount;
    }, 0);

  const formatSessionDateTime = (date, time) => {
    const sessionDateTime = new Date(`${date}T${time}`);

    return sessionDateTime.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

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
      preferredName: guest.preferredName || "",
      lastName: guest.lastName || "",
      sex: guest.sex || "",
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
      departureAirport: guest.departureAirport || "",
      passportNumber: guest.passportNumber || "",
      passportExpiration: guest.passportExpiration || "",
      passportIssuingCountry: guest.passportIssuingCountry || "",
      nationality: guest.nationality || "",
      citizenship: guest.citizenship || "",
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
                preferredName: guest.preferredName || "",
                lastName: guest.lastName || "",
                sex: guest.sex || "",
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
        {(isEditingPersonalInfo || guest.preferredName) && (
          <div className="detail-row">
            <span>Preferred Name (Optional)</span>

            {isEditingPersonalInfo ? (
              <input
                type="text"
                value={editPersonalInfo.preferredName}
                onChange={(event) =>
                  setEditPersonalInfo({
                    ...editPersonalInfo,
                    preferredName: event.target.value,
                  })
                }
              />
            ) : (
              <span>{guest.preferredName}</span>
            )}
          </div>
        )}

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
          <span>Sex</span>

          {isEditingPersonalInfo ? (
            <input
              type="text"
              value={editPersonalInfo.sex}
              onChange={(event) =>
                setEditPersonalInfo({
                  ...editPersonalInfo,
                  sex: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.sex || ""}</strong>
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
                departureAirport: guest.departureAirport || "",
                passportNumber: guest.passportNumber || "",
                passportExpiration: guest.passportExpiration || "",
                passportIssuingCountry: guest.passportIssuingCountry || "",
                nationality: guest.nationality || "",
                citizenship: guest.citizenship || "",
              });

              setIsEditingTravelInfo(true);
            }}
          >
            Edit
          </button>
        </div>
        <div className="detail-row">
          <span>Departure Airport</span>

          {isEditingTravelInfo ? (
            <input
              type="text"
              value={editTravelInfo.departureAirport}
              onChange={(event) =>
                setEditTravelInfo({
                  ...editTravelInfo,
                  departureAirport: event.target.value.toUpperCase(),
                })
              }
              maxLength={3}
            />
          ) : (
            <strong>{guest.departureAirport || ""}</strong>
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
        <div className="detail-row">
          <span>Passport Issuing Country</span>

          {isEditingTravelInfo ? (
            <input
              type="text"
              value={editTravelInfo.passportIssuingCountry}
              onChange={(event) =>
                setEditTravelInfo({
                  ...editTravelInfo,
                  passportIssuingCountry: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.passportIssuingCountry || ""}</strong>
          )}
        </div>

        <div className="detail-row">
          <span>Nationality</span>

          {isEditingTravelInfo ? (
            <input
              type="text"
              value={editTravelInfo.nationality}
              onChange={(event) =>
                setEditTravelInfo({
                  ...editTravelInfo,
                  nationality: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.nationality || ""}</strong>
          )}
        </div>

        <div className="detail-row">
          <span>Citizenship</span>

          {isEditingTravelInfo ? (
            <input
              type="text"
              value={editTravelInfo.citizenship}
              onChange={(event) =>
                setEditTravelInfo({
                  ...editTravelInfo,
                  citizenship: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.citizenship || ""}</strong>
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
      <section className="details-section">
        <div className="details-section-header">
          <h2>Trip Selections</h2>

          {!isEditingSelections && (
            <button
              type="button"
              onClick={() => {
                setEditSelections(guest.activities ?? []);
                setIsEditingSelections(true);
              }}
            >
              Edit
            </button>
          )}
        </div>

        {isEditingSelections ? (
          <div className="selection-edit-list">
            {availableSelections.map((selection) => (
              <label key={selection.id}>
                <input
                  type="checkbox"
                  checked={editSelections.some(
                    (activity) => activity.id === selection.id,
                  )}
                  onChange={() => {
                    setEditSelections((currentSelections) => {
                      const isSelected = currentSelections.some(
                        (activity) => activity.id === selection.id,
                      );

                      if (isSelected) {
                        return currentSelections.filter(
                          (activity) => activity.id !== selection.id,
                        );
                      }

                      return [
                        ...currentSelections,
                        {
                          id: selection.id,
                          type: selection.type,
                          name: selection.name,
                        },
                      ];
                    });
                  }}
                />

                <div className="selection-edit-content">
                  <strong>
                    {selection.type}: {selection.name}
                  </strong>

                  <div className="selection-session-list">
                    {selection.sessions.map((session) => (
                      <label className="selection-session" key={session.id}>
                        <input
                          type="radio"
                          name={`selection-${selection.id}`}
                          checked={editSelections.some(
                            (activity) =>
                              activity.id === selection.id &&
                              activity.sessionId === session.id,
                          )}
                          disabled={
                            !(guest.activities ?? []).some(
                              (activity) =>
                                activity.id === selection.id &&
                                activity.sessionId === session.id,
                            ) &&
                            (!session.active ||
                              getSessionRegistrationCount(session.id) >=
                                session.maxCapacity)
                          }
                          onChange={() => {
                            setEditSelections((currentSelections) =>
                              currentSelections.map((activity) =>
                                activity.id === selection.id
                                  ? {
                                      ...activity,
                                      sessionId: session.id,
                                    }
                                  : activity,
                              ),
                            );
                          }}
                        />

                        <span>
                          {formatSessionDateTime(session.date, session.time)}
                        </span>
                        <span>
                          {!session.active
                            ? "Unavailable"
                            : getSessionRegistrationCount(session.id) >=
                                session.maxCapacity
                              ? "Full"
                              : `${session.maxCapacity - getSessionRegistrationCount(session.id)} spots left`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </label>
            ))}
            <div className="selection-edit-actions">
              <button
                type="button"
                onClick={() => {
                  const hasMissingSession = editSelections.some(
                    (activity) => !activity.sessionId,
                  );

                  if (hasMissingSession) {
                    alert("Please select a session for each trip selection.");
                    return;
                  }
                  setRegistrationsByTrip((currentRegistrations) => ({
                    ...currentRegistrations,
                    [tripId]: currentRegistrations[tripId].map(
                      (currentRegistration) =>
                        currentRegistration.travelerNumber ===
                        registration.travelerNumber
                          ? {
                              ...currentRegistration,
                              guest: {
                                ...currentRegistration.guest,
                                activities: editSelections,
                              },
                            }
                          : currentRegistration,
                    ),
                  }));

                  setIsEditingSelections(false);
                }}
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditSelections([]);
                  setIsEditingSelections(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (guest.activities ?? []).length > 0 ? (
          (guest.activities ?? []).map((activity) => (
            <div className="detail-row" key={activity.id}>
              <span>{activity.type}</span>
              <strong>{activity.name}</strong>
            </div>
          ))
        ) : (
          <p>No trip selections.</p>
        )}
      </section>
    </main>
  );
};

export default GuestDetails;
