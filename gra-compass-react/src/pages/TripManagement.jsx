import { useState } from "react";
import { useParams } from "react-router-dom";

import selectionsByTrip from "../data/mockTripSelections";

import "../components/TripManagement.css";

const TripManagement = ({ trips, setTrips }) => {
  const { tripId } = useParams();
  const trip = trips.find((trip) => trip.id === Number(tripId));
  console.log("Current trip:", trip);
  const getRegistrationStatus = () => {
    if (!trip) {
      return "OPEN";
    }

    if (trip.registrationCapacity === 0) {
      return "NOT OPEN";
    }

    if (trip.registrationCount >= trip.registrationCapacity) {
      return "FULL";
    }

    if (trip.registrationsPaused) {
      return "PAUSED";
    }

    return "OPEN";
  };

  const registrationStatus = getRegistrationStatus();

  const [editTripName, setEditTripName] = useState(trip?.name || "");
  const [editDestination, setEditDestination] = useState(
    trip?.destination || "",
  );
  const [selectedSessionIds, setSelectedSessionIds] = useState({});

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().split("T")[0];
  };

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

  const [editStartDate, setEditStartDate] = useState(
    formatDateForInput(trip?.startDate),
  );

  const [editEndDate, setEditEndDate] = useState(
    formatDateForInput(trip?.endDate),
  );
  const [editImagePreview, setEditImagePreview] = useState(
    trip?.imagePreview || "",
  );

  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [savedField, setSavedField] = useState("");

  const showSavedFeedback = (fieldName) => {
    setSavedField(fieldName);

    setTimeout(() => {
      setSavedField("");
    }, 2000);
  };

  const handleSaveTripName = () => {
    if (!editTripName.trim()) {
      alert("Trip name is required.");
      return;
    }

    setTrips((currentTrips) =>
      currentTrips.map((currentTrip) =>
        currentTrip.id === Number(tripId)
          ? {
            ...currentTrip,
            name: editTripName.trim(),
          }
          : currentTrip,
      ),
    );
    showSavedFeedback("name");
  };

  const handleSaveDestination = () => {
    if (!editDestination.trim()) {
      alert("Destination is required.");
      return;
    }

    setTrips((currentTrips) =>
      currentTrips.map((currentTrip) =>
        currentTrip.id === Number(tripId)
          ? {
            ...currentTrip,
            destination: editDestination.trim(),
          }
          : currentTrip,
      ),
    );
    showSavedFeedback("destination");
  };

  const handleSaveStartDate = () => {
    if (!editStartDate) {
      alert("Start date is required.");
      return;
    }

    setTrips((currentTrips) =>
      currentTrips.map((currentTrip) =>
        currentTrip.id === Number(tripId)
          ? {
            ...currentTrip,
            startDate: editStartDate,
          }
          : currentTrip,
      ),
    );
    showSavedFeedback("startDate");
  };

  const handleSaveEndDate = () => {
    if (!editEndDate) {
      alert("End date is required.");
      return;
    }

    if (editEndDate < editStartDate) {
      alert("End date cannot be before the start date.");
      return;
    }

    setTrips((currentTrips) =>
      currentTrips.map((currentTrip) =>
        currentTrip.id === Number(tripId)
          ? {
            ...currentTrip,
            endDate: editEndDate,
          }
          : currentTrip,
      ),
    );
    showSavedFeedback("endDate");
  };
  const handleSaveTripImage = () => {
    if (!editImagePreview) {
      alert("Please select an image.");
      return;
    }

    setTrips((currentTrips) =>
      currentTrips.map((currentTrip) =>
        currentTrip.id === Number(tripId)
          ? {
            ...currentTrip,
            imagePreview: editImagePreview,
          }
          : currentTrip,
      ),
    );

    showSavedFeedback("image");
  };

  const [selections, setSelections] = useState(selectionsByTrip[tripId] || []);

  const [newType, setNewType] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newMaxCapacity, setNewMaxCapacity] = useState("");
  const [editMaxCapacity, setEditMaxCapacity] = useState("");
  const [newSessionDate, setNewSessionDate] = useState("");
  const [newSessionTime, setNewSessionTime] = useState("");
  const [addingSessionToId, setAddingSessionToId] = useState(null);

  const [additionalSessionDate, setAdditionalSessionDate] =
    useState("");

  const [additionalSessionTime, setAdditionalSessionTime] =
    useState("");

  const [additionalSessionCapacity, setAdditionalSessionCapacity] =
    useState("");
  const [isEditingRegistrationSettings, setIsEditingRegistrationSettings] =
    useState(false);

  const [editRegistrationCapacity, setEditRegistrationCapacity] = useState(
    trip?.registrationCapacity ?? 0,
  );

  const [editSessionDate, setEditSessionDate] = useState("");
  const [editSessionTime, setEditSessionTime] = useState("");

  const [editingSelectionId, setEditingSelectionId] = useState(null);
  const [editSelectionType, setEditSelectionType] = useState("");
  const [editSelectionName, setEditSelectionName] = useState("");

  const handleAddSelection = () => {
    if (
      !newType.trim() ||
      !newName.trim() ||
      !newSessionDate ||
      !newSessionTime
    ) {
      alert("Selection type, name, session date, and session time are required.");
      return;
    }

    const capacity = newMaxCapacity ? Number(newMaxCapacity) : null;

    if (capacity !== null && capacity < 1) {
      alert("Max capacity must be at least 1.");
      return;
    }

    const newSelection = {
      id: Date.now(),
      type: newType.trim(),
      name: newName.trim(),
      sessions: [
        {
          id: Date.now() + 1,
          date: newSessionDate,
          time: newSessionTime,
          maxCapacity: capacity,
          registeredCount: 0,
          active: true,
        },
      ],
    };

    setSelections([...selections, newSelection]);

    setNewType("");
    setNewName("");
    setNewMaxCapacity("");
    setNewSessionDate("");
    setNewSessionTime("");
  };
  const handleEditClick = (selection, session) => {
    setEditingId(session.id);
    setEditSessionDate(session.date || "");
    setEditSessionTime(session.time || "");
    setEditMaxCapacity(session.maxCapacity ?? "");
  };
  const handleDeleteSelection = (selectionId, sessionId) => {
    const selection = selections.find(
      (selection) => selection.id === selectionId,
    );

    const session = selection?.sessions.find(
      (session) => session.id === sessionId,
    );

    if ((session?.registeredCount ?? 0) > 0) {
      alert(
        `This session cannot be deleted because ${session.registeredCount} people are already registered for it.`,
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this session?",
    );

    if (!confirmed) {
      return;
    }

    const updatedSelections = selections.map((selection) =>
      selection.id === selectionId
        ? {
          ...selection,
          sessions: selection.sessions.filter(
            (session) => session.id !== sessionId,
          ),
        }
        : selection,
    );

    setSelections(updatedSelections);
    setSelectedSessionIds((currentSelections) => {
      const remainingSessions =
        updatedSelections.find(
          (selection) => selection.id === selectionId
        )?.sessions || [];

      const nextSessionId = remainingSessions[0]?.id;

      if (nextSessionId) {
        return {
          ...currentSelections,
          [selectionId]: nextSessionId,
        };
      }

      const updatedSelectedSessions = {
        ...currentSelections,
      };

      delete updatedSelectedSessions[selectionId];

      return updatedSelectedSessions;
    });
  };

  const handleSaveEdit = (selectionId, sessionId) => {
    if (!editSessionDate || !editSessionTime) {
      alert("Session date and time are required.");
      return;
    }

    const selection = selections.find(
      (selection) => selection.id === selectionId,
    );

    const currentSession = selection?.sessions.find(
      (session) => session.id === sessionId,
    );

    const newCapacity = editMaxCapacity
      ? Number(editMaxCapacity)
      : null;

    if (
      newCapacity !== null &&
      newCapacity < (currentSession?.registeredCount ?? 0)
    ) {
      alert(
        `Capacity cannot be lower than the ${currentSession?.registeredCount ?? 0} people already registered.`,
      );
      return;
    }

    const updatedSelections = selections.map((selection) =>
      selection.id === selectionId
        ? {
          ...selection,
          sessions: selection.sessions.map((session) =>
            session.id === sessionId
              ? {
                ...session,
                date: editSessionDate,
                time: editSessionTime,
                maxCapacity: newCapacity,
              }
              : session,
          ),
        }
        : selection,
    );

    setSelections(updatedSelections);
    setEditingId(null);
    setEditSessionDate("");
    setEditSessionTime("");
    setEditMaxCapacity("");
  };
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditSessionDate("");
    setEditSessionTime("");
    setEditMaxCapacity("");
  };
  const handleToggleActive = (selectionId, sessionId) => {
    const updatedSelections = selections.map((selection) =>
      selection.id === selectionId
        ? {
          ...selection,
          sessions: selection.sessions.map((session) =>
            session.id === sessionId
              ? {
                ...session,
                active: !session.active,
              }
              : session,
          ),
        }
        : selection,
    );

    setSelections(updatedSelections);
  };

  const handlePauseRegistrations = () => {
    setTrips((currentTrips) =>
      currentTrips.map((currentTrip) =>
        currentTrip.id === Number(tripId)
          ? {
            ...currentTrip,
            registrationsPaused: true,
          }
          : currentTrip,
      ),
    );
  };

  const handleResumeRegistrations = () => {
    setTrips((currentTrips) =>
      currentTrips.map((currentTrip) =>
        currentTrip.id === Number(tripId)
          ? {
            ...currentTrip,
            registrationsPaused: false,
          }
          : currentTrip,
      ),
    );
  };

  const handleSaveRegistrationCapacity = () => {
    const capacity = Number(editRegistrationCapacity);

    if (capacity < trip.registrationCount) {
      alert(
        `Capacity cannot be lower than the ${trip.registrationCount} existing registrations.`,
      );
      return;
    }

    setTrips((currentTrips) =>
      currentTrips.map((currentTrip) =>
        currentTrip.id === Number(tripId)
          ? {
            ...currentTrip,
            registrationCapacity: capacity,
          }
          : currentTrip,
      ),
    );

    setIsEditingRegistrationSettings(false);
  };
  const handleAddSession = (selectionId) => {
    if (!additionalSessionDate || !additionalSessionTime) {
      alert("Session date and time are required.");
      return;
    }

    const capacity = additionalSessionCapacity
      ? Number(additionalSessionCapacity)
      : null;

    if (capacity !== null && capacity < 1) {
      alert("Max capacity must be at least 1.");
      return;
    }

    const newSession = {
      id: Date.now(),
      date: additionalSessionDate,
      time: additionalSessionTime,
      maxCapacity: capacity,
      registeredCount: 0,
      active: true,
    };

    const updatedSelections = selections.map((selection) =>
      selection.id === selectionId
        ? {
          ...selection,
          sessions: [...selection.sessions, newSession],
        }
        : selection
    );

    setSelections(updatedSelections);

    setSelectedSessionIds((currentSelections) => ({
      ...currentSelections,
      [selectionId]: newSession.id,
    }));

    setAddingSessionToId(null);
    setAdditionalSessionDate("");
    setAdditionalSessionTime("");
    setAdditionalSessionCapacity("");
  };

  const handleSaveSelectionEdit = (selectionId) => {
    if (!editSelectionType.trim() || !editSelectionName.trim()) {
      alert("Selection type and name are required.");
      return;
    }

    const updatedSelections = selections.map((selection) =>
      selection.id === selectionId
        ? {
          ...selection,
          type: editSelectionType.trim(),
          name: editSelectionName.trim(),
        }
        : selection
    );

    setSelections(updatedSelections);

    setEditingSelectionId(null);
    setEditSelectionType("");
    setEditSelectionName("");
  };

  return (
    <main className="trip-management-page">
      {isEditingTrip && (
        <div className="trip-edit-section">
          <div className="trip-details-edit">
            <label htmlFor="editTripName">Trip Name</label>
            <input
              id="editTripName"
              type="text"
              value={savedField === "name" ? "Saved!" : editTripName}
              onChange={(event) => setEditTripName(event.target.value)}
              className={savedField === "name" ? "saved-input" : ""}
              disabled={savedField === "name"}
            />

            <button type="button" onClick={handleSaveTripName}>
              Save
            </button>
          </div>

          <div className="trip-details-edit">
            <label htmlFor="editDestination">Destination</label>
            <input
              id="editDestination"
              type="text"
              value={savedField === "destination" ? "Saved!" : editDestination}
              onChange={(event) => setEditDestination(event.target.value)}
              className={savedField === "destination" ? "saved-input" : ""}
              disabled={savedField === "destination"}
            />
            <button type="button" onClick={handleSaveDestination}>
              Save
            </button>
          </div>

          <div className="trip-details-edit">
            <label htmlFor="editStartDate">Start Date</label>

            <input
              id="editStartDate"
              type="date"
              value={editStartDate}
              onChange={(event) => setEditStartDate(event.target.value)}
              className={savedField === "startDate" ? "saved-input" : ""}
            />
            <button type="button" onClick={handleSaveStartDate}>
              Save
            </button>
          </div>

          <div className="trip-details-edit">
            <label htmlFor="editEndDate">End Date</label>

            <input
              id="editEndDate"
              type="date"
              value={editEndDate}
              onChange={(event) => setEditEndDate(event.target.value)}
              className={savedField === "endDate" ? "saved-input" : ""}
            />
            <button type="button" onClick={handleSaveEndDate}>
              Save
            </button>
          </div>
          <div className="trip-details-edit">
            <label htmlFor="editTripImage">Trip Image</label>

            <input
              id="editTripImage"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files[0];

                if (file) {
                  setEditImagePreview(URL.createObjectURL(file));
                }
              }}
            />
            {editImagePreview && (
              <img
                src={editImagePreview}
                alt="Trip preview"
                className="trip-image-preview"
              />
            )}
            <button
              type="button"
              onClick={handleSaveTripImage}
              disabled={savedField === "image"}
            >
              Save
            </button>
          </div>
          <button type="button" onClick={() => setIsEditingTrip(false)}>
            Done Editing
          </button>
        </div>
      )}

      <h1>{trip?.name || "Trip Management"}</h1>
      <p>{trip?.destination}</p>
      <div className="trip-summary-date-row">
        <p>
          {formatDateForDisplay(trip?.startDate)} -{" "}
          {formatDateForDisplay(trip?.endDate)}
        </p>

        <button
          type="button"
          className="edit-trip-summary-button"
          onClick={() => setIsEditingTrip(true)}
        >
          Edit Trip
        </button>
      </div>
      <div className="registration-controls">
        <h2>Registration Status</h2>

        <div className="registration-status-row">
          <strong>Status:</strong>

          <span
            className={`registration-status registration-status-${registrationStatus
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            <span className="registration-status-dot"></span>
            {registrationStatus}
          </span>
        </div>

        <p>
          <strong>Registrations:</strong> {trip?.registrationCount} /{" "}
          {trip?.registrationCapacity}
        </p>

        {registrationStatus === "OPEN" && (
          <button type="button" onClick={handlePauseRegistrations}>
            Pause Registrations
          </button>
        )}

        {registrationStatus === "PAUSED" && (
          <button type="button" onClick={handleResumeRegistrations}>
            Resume Registrations
          </button>
        )}
      </div>
      <button
        type="button"
        className="edit-registration-settings-button"
        onClick={() => setIsEditingRegistrationSettings(true)}
      >
        Edit Registration Settings
      </button>

      {isEditingRegistrationSettings && (
        <div className="registration-settings-edit">
          <label htmlFor="editRegistrationCapacity">
            Registration Capacity
          </label>

          <input
            id="editRegistrationCapacity"
            type="number"
            min={trip?.registrationCount || 0}
            step="1"
            value={editRegistrationCapacity}
            onChange={(event) =>
              setEditRegistrationCapacity(event.target.value)
            }
          />

          <button type="button" onClick={handleSaveRegistrationCapacity}>
            Save
          </button>

          <button
            type="button"
            onClick={() => setIsEditingRegistrationSettings(false)}
          >
            Cancel
          </button>
        </div>
      )}

      <section>
        <h2>Available Trip Selections</h2>

        {selections.map((selection) => {
          const selectedSessionId =
            selectedSessionIds[selection.id] ?? selection.sessions?.[0]?.id;

          const selectedSession = selection.sessions?.find(
            (session) => session.id === selectedSessionId,
          );

          return (
            <div key={selection.id} className="selection-card">
              {editingId === selectedSession?.id ? (
                <>
                  <input
                    type="date"
                    value={editSessionDate}
                    onChange={(event) =>
                      setEditSessionDate(event.target.value)
                    }
                  />

                  <input
                    type="time"
                    value={editSessionTime}
                    onChange={(event) =>
                      setEditSessionTime(event.target.value)
                    }
                  />

                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Max capacity"
                    value={editMaxCapacity}
                    onChange={(event) =>
                      setEditMaxCapacity(event.target.value)
                    }
                  />

                  <div className="selection-actions">
                    <button
                      onClick={() =>
                        handleSaveEdit(selection.id, selectedSession.id)
                      }
                    >
                      Save
                    </button>

                    <button onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {editingSelectionId === selection.id ? (
                    <div className="edit-selection-form">
                      <input
                        type="text"
                        value={editSelectionType}
                        onChange={(event) =>
                          setEditSelectionType(event.target.value)
                        }
                        placeholder="Selection type"
                      />

                      <input
                        type="text"
                        value={editSelectionName}
                        onChange={(event) =>
                          setEditSelectionName(event.target.value)
                        }
                        placeholder="Selection name"
                      />
                      <div className="selection-actions">
                        <button
                          onClick={() => handleSaveSelectionEdit(selection.id)}
                        >
                          Save
                        </button>

                        <button
                          onClick={() => {
                            setEditingSelectionId(null);
                            setEditSelectionType("");
                            setEditSelectionName("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="details-section-header">
                      <p>
                        <strong>{selection.type}:</strong> {selection.name}
                      </p>

                      <button
                        className="edit-button"
                        onClick={() => {
                          setEditingSelectionId(selection.id);
                          setEditSelectionType(selection.type);
                          setEditSelectionName(selection.name);
                        }}
                      >
                        Edit Excursion
                      </button>
                    </div>
                  )}
                  {selection.sessions?.length > 0 ? (
                    <div className="session-selector">
                      <label>
                        <strong>Session</strong>
                      </label>

                      <select
                        value={
                          selectedSessionIds[selection.id] ??
                          selection.sessions[0].id
                        }
                        onChange={(event) =>
                          setSelectedSessionIds({
                            ...selectedSessionIds,
                            [selection.id]: Number(event.target.value),
                          })
                        }
                      >
                        {selection.sessions.map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.date} — {session.time}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p>No sessions available.</p>
                  )}
                  {selectedSession && (
                    <>
                      <p>
                        <strong>Capacity:</strong>{" "}
                        {selectedSession.maxCapacity ?? "No limit"}
                      </p>

                      <p>
                        <strong>Registered:</strong>{" "}
                        {selectedSession.registeredCount ?? 0}
                      </p>

                      <p>
                        <strong>Remaining:</strong>{" "}
                        {selectedSession.maxCapacity
                          ? selectedSession.maxCapacity -
                          (selectedSession.registeredCount ?? 0)
                          : "No limit"}
                      </p>

                      {selectedSession.maxCapacity &&
                        (selectedSession.registeredCount ?? 0) >=
                        selectedSession.maxCapacity && (
                          <p className="selection-full">FULL</p>
                        )}

                      <div className="selection-actions">
                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEditClick(selection, selectedSession)
                          }
                        >
                          Edit Session
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDeleteSelection(selection.id, selectedSession.id)
                          }
                        >
                          Delete Session
                        </button>

                        <button
                          className={
                            selectedSession.active
                              ? "deactivate-button"
                              : "activate-button"
                          }
                          onClick={() =>
                            handleToggleActive(selection.id, selectedSession.id)
                          }
                        >
                          {selectedSession.active ? "Deactivate" : "Activate"}
                        </button>

                        <p>
                          <strong>Status:</strong>{" "}
                          {selectedSession.active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="selection-actions">
                    <button
                      className="edit-button"
                      onClick={() =>
                        setAddingSessionToId(selection.id)
                      }
                    >
                      Add Session
                    </button>
                  </div>

                  {addingSessionToId === selection.id && (
                    <div className="add-session-form">
                      <input
                        type="date"
                        value={additionalSessionDate}
                        onChange={(event) =>
                          setAdditionalSessionDate(event.target.value)
                        }
                      />

                      <input
                        type="time"
                        value={additionalSessionTime}
                        onChange={(event) =>
                          setAdditionalSessionTime(event.target.value)
                        }
                      />

                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Max capacity"
                        value={additionalSessionCapacity}
                        onChange={(event) =>
                          setAdditionalSessionCapacity(event.target.value)
                        }
                      />

                      <div className="selection-actions">
                        <button
                          onClick={() =>
                            handleAddSession(selection.id)
                          }
                        >
                          Add Session
                        </button>

                        <button
                          onClick={() => {
                            setAddingSessionToId(null);
                            setAdditionalSessionDate("");
                            setAdditionalSessionTime("");
                            setAdditionalSessionCapacity("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
        <div className="add-selection-form">
          <input
            type="text"
            placeholder="Selection type"
            value={newType}
            onChange={(event) => setNewType(event.target.value)}
          />

          <input
            type="text"
            placeholder="Selection name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />
          <input
            type="date"
            value={newSessionDate}
            onChange={(event) =>
              setNewSessionDate(event.target.value)
            }
          />

          <input
            type="time"
            value={newSessionTime}
            onChange={(event) =>
              setNewSessionTime(event.target.value)
            }
          />

          <input
            type="number"
            min="1"
            placeholder="Max capacity"
            value={newMaxCapacity}
            onChange={(event) => setNewMaxCapacity(event.target.value)}
          />

          <button onClick={handleAddSelection}>Add Selection</button>
        </div>
      </section>
    </main>
  );
};

export default TripManagement;
