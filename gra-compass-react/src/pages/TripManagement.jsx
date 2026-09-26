import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import selectionsByTrip from "../data/mockTripSelections";
import "../styles/TripManagement.css";
import SelectionCard from "../components/SelectionCard";
import RegistrationSummary from "../components/RegistrationSummary";
import RegistrationSettings from "../components/RegistrationSettings";
import RegistrationList from "../components/RegistrationList";

const TripManagement = ({ trips, setTrips, registrationsByTrip }) => {
  const { tripId } = useParams();
  const trip = trips.find((trip) => trip.id === Number(tripId));
  console.log("Current trip:", trip);
  const getRegistrationStatus = () => {
    if (!trip) {
      return "CLOSED";
    }

    const today = new Date();
    const tripStartDate = new Date(trip.startDate);

    if (today >= tripStartDate) {
      return "CLOSED";
    }

    if (trip.registrationCloseDate) {
      const registrationCloseDate = new Date(
        `${trip.registrationCloseDate}T23:59:59`,
      );

      if (today > registrationCloseDate) {
        return "CLOSED";
      }
    }

    if (trip.registrationsPaused) {
      return "PAUSED";
    }

    return "OPEN";
  };

  const registrationStatus = getRegistrationStatus();

  const tripRegistrations = registrationsByTrip[tripId] || [];

  const getSessionRegistrationCount = (sessionId) =>
    tripRegistrations.filter((registration) =>
      registration.activities?.some(
        (activity) => activity.sessionId === sessionId,
      ),
    ).length;

  const travelerCount = tripRegistrations.reduce(
    (total, registration) =>
      total + 1 + (registration.bringingGuest && registration.guest ? 1 : 0),
    0,
  );

  const [editTripName, setEditTripName] = useState(trip?.name || "");
  const [editDestination, setEditDestination] = useState(
    trip?.destination || "",
  );
  const [selectedSessionIds, setSelectedSessionIds] = useState({});
  const [editingRegistrationSettings, setEditingRegistrationSettings] =
    useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = (tab) => {
    if (tab === "overview") {
      setSearchParams({});
      return;
    }

    setSearchParams({ tab });
  };

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

  const handleSaveRegistrationSettings = ({
    registrationCapacity,
    travelerCapacity,
    registrationCloseDate,
  }) => {
    const newRegistrationCapacity = Number(registrationCapacity);
    const newTravelerCapacity = Number(travelerCapacity);

    if (newRegistrationCapacity < 1) {
      alert("Registration capacity must be at least 1.");
      return;
    }

    if (newTravelerCapacity < 1) {
      alert("Traveler capacity must be at least 1.");
      return;
    }
    if (newTravelerCapacity < newRegistrationCapacity) {
      alert("Traveler capacity cannot be lower than registration capacity.");
      return;
    }

    if (newRegistrationCapacity < tripRegistrations.length) {
      alert(
        `Registration capacity cannot be lower than the ${tripRegistrations.length} existing registrations.`,
      );
      return;
    }

    if (newTravelerCapacity < travelerCount) {
      alert(
        `Traveler capacity cannot be lower than the ${travelerCount} existing travelers.`,
      );
      return;
    }

    setTrips((currentTrips) =>
      currentTrips.map((currentTrip) =>
        currentTrip.id === Number(tripId)
          ? {
              ...currentTrip,
              registrationCapacity: newRegistrationCapacity,
              travelerCapacity: newTravelerCapacity,
              registrationCloseDate,
            }
          : currentTrip,
      ),
    );

    setEditingRegistrationSettings(false);
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

    const registeredCount = session
      ? getSessionRegistrationCount(session.id)
      : 0;

    if (registeredCount > 0) {
      alert(
        `This session cannot be deleted because ${registeredCount} people are already registered for it.`,
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
      return false;
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
    return true;
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

    const registeredCount = currentSession
      ? getSessionRegistrationCount(currentSession.id)
      : 0;

    if (newCapacity !== null && newCapacity < registeredCount) {
      alert(
        `Capacity cannot be lower than the ${registeredCount} people already registered.`,
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
      <div className="trip-management-tabs">
        <button
          type="button"
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => handleTabChange("overview")}
        >
          Overview
        </button>

        <button
          type="button"
          className={activeTab === "registrations" ? "active" : ""}
          onClick={() => handleTabChange("registrations")}
        >
          Registrations
        </button>

        <button
          type="button"
          className={activeTab === "selections" ? "active" : ""}
          onClick={() => handleTabChange("selections")}
        >
          Trip Selections
        </button>
      </div>
      {activeTab === "overview" &&
        (editingRegistrationSettings ? (
          <RegistrationSettings
            registrationCapacity={trip?.registrationCapacity}
            travelerCapacity={trip?.travelerCapacity}
            registrationCloseDate={trip?.registrationCloseDate}
            registrationsPaused={trip?.registrationsPaused ?? false}
            onSave={handleSaveRegistrationSettings}
            onCancel={() => setEditingRegistrationSettings(false)}
            onPause={handlePauseRegistrations}
            onResume={handleResumeRegistrations}
          />
        ) : (
          <RegistrationSummary
            status={registrationStatus}
            registrationCount={tripRegistrations.length}
            travelerCount={travelerCount}
            registrationCloseDate={trip?.registrationCloseDate}
            onEditSettings={() => setEditingRegistrationSettings(true)}
          />
        ))}
      {activeTab === "registrations" && (
        <section className="trip-management-registrations">
          <h2>Registrations</h2>

          <RegistrationList tripId={tripId} registrations={tripRegistrations} />
        </section>
      )}
      {activeTab === "selections" && (
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
              getSessionRegistrationCount={getSessionRegistrationCount}
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
      )}
    </main>
  );
};

export default TripManagement;
