import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRegistrationsByTrip,
  updateRegistration,
  reserveGuestActivity,
  cancelGuestActivity,
} from "../store/registrationsSlice";
import { useParams, useNavigate } from "react-router-dom";

import "../styles/RegistrationDetails.css";

import { fetchActivities } from "../store/activitiesSlice";

const GuestDetails = () => {
  const { tripId, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const registrations = useSelector(
    (state) => state.registrations.byTrip[tripId] || [],
  );

  useEffect(() => {
    dispatch(fetchRegistrationsByTrip(tripId));
    dispatch(fetchActivities(tripId));
  }, [dispatch, tripId]);
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
    airport: "",
    passportNumber: "",
    passportExpiration: "",
  });

  const [isEditingAccessibilityDietary, setIsEditingAccessibilityDietary] =
    useState(false);

  const [editAccessibilityDietary, setEditAccessibilityDietary] = useState({
    accessibility: "",
    dietaryRequirements: "",
  });

  const [isEditingSelections, setIsEditingSelections] = useState(false);
  const [editSelections, setEditSelections] = useState([]);
  const [isSavingSelections, setIsSavingSelections] = useState(false);

  const registration = registrations.find(
    (registration) => registration.travelerNumber === Number(id),
  );

  const guest = registration?.guest;

  const activities = useSelector(
    (state) => state.activities.byTrip[tripId] ?? [],
  );

  const availableSelections = activities;

  const formatSessionDateTime = (date, time) => {
    const sessionDateTime = new Date(`${date}T${time}`);

    return sessionDateTime.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
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
  const handleSaveSelections = async () => {
    if (isSavingSelections) {
      return;
    }

    const hasMissingSession = editSelections.some(
      (activity) => !activity.sessionId,
    );

    if (hasMissingSession) {
      alert("Please select a session for each trip selection.");
      return;
    }

    const existingSelections = guest.activities ?? [];

    const matchesSelection = (first, second) =>
      (first.activityId ?? first.id) === (second.activityId ?? second.id) &&
      first.sessionId === second.sessionId;

    const selectionsToCancel = existingSelections.filter(
      (existing) =>
        !editSelections.some((edited) => matchesSelection(existing, edited)),
    );

    const selectionsToReserve = editSelections.filter(
      (edited) =>
        !existingSelections.some((existing) =>
          matchesSelection(existing, edited),
        ),
    );

    setIsSavingSelections(true);

    try {
      for (const selection of selectionsToCancel) {
        await dispatch(
          cancelGuestActivity({
            tripId,
            travelerNumber: registration.travelerNumber,
            activityId: selection.activityId ?? selection.id,
            sessionId: selection.sessionId,
          }),
        ).unwrap();
      }

      for (const selection of selectionsToReserve) {
        await dispatch(
          reserveGuestActivity({
            tripId,
            travelerNumber: registration.travelerNumber,
            activityId: selection.activityId ?? selection.id,
            sessionId: selection.sessionId,
          }),
        ).unwrap();
      }

      setIsEditingSelections(false);
    } catch (error) {
      alert(error.message || "Failed to save guest trip selections.");
    } finally {
      try {
        await dispatch(fetchActivities(tripId));
        await dispatch(fetchRegistrationsByTrip(tripId));
      } finally {
        setIsSavingSelections(false);
      }
    }
  };

  const handleSavePersonalInfo = async () => {
    const updatedRegistration = {
      ...registration,
      guest: {
        ...registration.guest,
        ...editPersonalInfo,
      },
    };

    await dispatch(
      updateRegistration({
        tripId,
        travelerNumber: registration.travelerNumber,
        registration: updatedRegistration,
      }),
    ).unwrap();

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

  const handleSaveTravelInfo = async () => {
    const updatedRegistration = {
      ...registration,
      guest: {
        ...registration.guest,
        ...editTravelInfo,
      },
    };

    await dispatch(
      updateRegistration({
        tripId,
        travelerNumber: registration.travelerNumber,
        registration: updatedRegistration,
      }),
    ).unwrap();

    setIsEditingTravelInfo(false);
  };

  const handleCancelTravelInfo = () => {
    setEditTravelInfo({
      airport: guest.airport || "",
      passportNumber: guest.passportNumber || "",
      passportExpiration: guest.passportExpiration || "",
      passportIssuingCountry: guest.passportIssuingCountry || "",
      nationality: guest.nationality || "",
      citizenship: guest.citizenship || "",
    });

    setIsEditingTravelInfo(false);
  };

  const handleSaveAccessibilityDietary = async () => {
    const updatedRegistration = {
      ...registration,
      guest: {
        ...registration.guest,
        ...editAccessibilityDietary,
      },
    };

    await dispatch(
      updateRegistration({
        tripId,
        travelerNumber: registration.travelerNumber,
        registration: updatedRegistration,
      }),
    ).unwrap();

    setIsEditingAccessibilityDietary(false);
  };

  const handleCancelAccessibilityDietary = () => {
    setEditAccessibilityDietary({
      accessibility: guest.accessibility || "",
      dietaryRequirements: guest.dietaryRequirements || "",
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
                airport: guest.airport || "",
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
              value={editTravelInfo.airport}
              onChange={(event) =>
                setEditTravelInfo({
                  ...editTravelInfo,
                  airport: event.target.value.toUpperCase(),
                })
              }
              maxLength={3}
            />
          ) : (
            <strong>{guest.airport || ""}</strong>
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
                dietaryRequirements: guest.dietaryRequirements || "",
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
              value={editAccessibilityDietary.dietaryRequirements}
              onChange={(event) =>
                setEditAccessibilityDietary({
                  ...editAccessibilityDietary,
                  dietaryRequirements: event.target.value,
                })
              }
            />
          ) : (
            <strong>{guest.dietaryRequirements || "None"}</strong>
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
              disabled={isSavingSelections}
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
                  disabled={isSavingSelections}
                  checked={editSelections.some(
                    (activity) =>
                      (activity.activityId ?? activity.id) === selection.id,
                  )}
                  onChange={() => {
                    setEditSelections((currentSelections) => {
                      const isSelected = currentSelections.some(
                        (activity) =>
                          (activity.activityId ?? activity.id) === selection.id,
                      );

                      if (isSelected) {
                        return currentSelections.filter(
                          (activity) =>
                            (activity.activityId ?? activity.id) !==
                            selection.id,
                        );
                      }

                      return [
                        ...currentSelections,
                        {
                          activityId: selection.id,
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
                              (activity.activityId ?? activity.id) ===
                                selection.id &&
                              activity.sessionId === session.id,
                          )}
                          disabled={
                            isSavingSelections ||
                            (!(guest.activities ?? []).some(
                              (activity) =>
                                (activity.activityId ?? activity.id) ===
                                  selection.id &&
                                activity.sessionId === session.id,
                            ) &&
                              (!session.active ||
                                (session.reservedCount ?? 0) >=
                                  session.maxCapacity))
                          }
                          onChange={() => {
                            setEditSelections((currentSelections) =>
                              currentSelections.map((activity) =>
                                (activity.activityId ?? activity.id) ===
                                selection.id
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
                            : (session.reservedCount ?? 0) >=
                                session.maxCapacity
                              ? "Full"
                              : `${session.maxCapacity - (session.reservedCount ?? 0)} spots left`}
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
                onClick={handleSaveSelections}
                disabled={isSavingSelections}
              >
                {isSavingSelections ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                disabled={isSavingSelections}
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
          (guest.activities ?? []).map((activity) => {
            const activityDetails = activities.find(
              (item) => item.id === activity.activityId,
            );

            const sessionDetails = activityDetails?.sessions?.find(
              (session) => session.id === activity.sessionId,
            );

            return (
              <div
                className="detail-row"
                key={`${activity.activityId}-${activity.sessionId}`}
              >
                <span>{activityDetails?.type ?? "Activity"}</span>
                <div className="selection-display-content">
                  <strong>{activityDetails?.name ?? "Unknown Activity"}</strong>

                  {sessionDetails && (
                    <span>
                      {formatSessionDateTime(
                        sessionDetails.date,
                        sessionDetails.time,
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>No trip selections.</p>
        )}
      </section>
    </main>
  );
};

export default GuestDetails;
