import { useState } from "react";
import { useParams } from "react-router-dom";
import selectionsByTrip from "../data/mockTripSelections";
import "../components/TripManagement.css";
import SelectionCard from "../components/SelectionCard";

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

  const [newMaxCapacity, setNewMaxCapacity] = useState("");

  const [newSessionDate, setNewSessionDate] = useState("");
  const [newSessionTime, setNewSessionTime] = useState("");

  const [isEditingRegistrationSettings, setIsEditingRegistrationSettings] =
    useState(false);

  const [editRegistrationCapacity, setEditRegistrationCapacity] = useState(
    trip?.registrationCapacity ?? 0,
  );

  const handleAddSelection = () => {
    if (
      !newType.trim() ||
      !newName.trim() ||
      !newSessionDate ||
      !newSessionTime
    ) {
      alert(
        "Selection type, name, session date, and session time are required.",
      );
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
      return false;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this session?",
    );

    if (!confirmed) {
      return false;
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

    const remainingSessions =
      updatedSelections.find((selection) => selection.id === selectionId)
        ?.sessions || [];

    return remainingSessions[0]?.id ?? null;
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
  const handleAddSession = (
    selectionId,
    sessionDate,
    sessionTime,
    sessionCapacity,
  ) => {
    if (!sessionDate || !sessionTime) {
      alert("Session date and time are required.");
      return false;
    }

    const capacity = sessionCapacity ? Number(sessionCapacity) : null;

    if (capacity !== null && capacity < 1) {
      alert("Max capacity must be at least 1.");
      return false;
    }

    const newSession = {
      id: Date.now(),
      date: sessionDate,
      time: sessionTime,
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
        : selection,
    );

    setSelections(updatedSelections);

    return newSession.id;
  };

  const handleSaveSelectionEdit = (
    selectionId,
    selectionType,
    selectionName,
  ) => {
    if (!selectionType.trim() || !selectionName.trim()) {
      alert("Selection type and name are required.");
      return;
    }

    const updatedSelections = selections.map((selection) =>
      selection.id === selectionId
        ? {
            ...selection,
            type: selectionType.trim(),
            name: selectionName.trim(),
          }
        : selection,
    );

    setSelections(updatedSelections);
  };

  const handleSaveEdit = (
    selectionId,
    sessionId,
    sessionDate,
    sessionTime,
    maxCapacity,
  ) => {
    if (!sessionDate || !sessionTime) {
      alert("Session date and time are required.");
      return false;
    }

    const selection = selections.find(
      (selection) => selection.id === selectionId,
    );

    const currentSession = selection?.sessions.find(
      (session) => session.id === sessionId,
    );

    const newCapacity = maxCapacity ? Number(maxCapacity) : null;

    if (
      newCapacity !== null &&
      newCapacity < (currentSession?.registeredCount ?? 0)
    ) {
      alert(
        `Capacity cannot be lower than the ${currentSession?.registeredCount ?? 0} people already registered.`,
      );
      return false;
    }

    const updatedSelections = selections.map((selection) =>
      selection.id === selectionId
        ? {
            ...selection,
            sessions: selection.sessions.map((session) =>
              session.id === sessionId
                ? {
                    ...session,
                    date: sessionDate,
                    time: sessionTime,
                    maxCapacity: newCapacity,
                  }
                : session,
            ),
          }
        : selection,
    );

    setSelections(updatedSelections);

    return true;
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

        {selections.map((selection) => (
          <SelectionCard
            key={selection.id}
            selection={selection}
            selectedSessionIds={selectedSessionIds}
            setSelectedSessionIds={setSelectedSessionIds}
            handleSaveSelectionEdit={handleSaveSelectionEdit}
            handleDeleteSelection={handleDeleteSelection}
            handleToggleActive={handleToggleActive}
            handleAddSession={handleAddSession}
            handleSaveEdit={handleSaveEdit}
          />
        ))}
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
            onChange={(event) => setNewSessionDate(event.target.value)}
          />

          <input
            type="time"
            value={newSessionTime}
            onChange={(event) => setNewSessionTime(event.target.value)}
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
