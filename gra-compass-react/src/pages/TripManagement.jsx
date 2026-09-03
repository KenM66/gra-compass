import { useState } from "react";
import { useParams } from "react-router-dom";

import selectionsByTrip from "../data/mockTripSelections";
import trips from "../data/mockTrips";
import "../components/TripManagement.css";

const TripManagement = () => {
  const { tripId } = useParams();
  const trip = trips.find((trip) => trip.id === Number(tripId));

  const [selections, setSelections] = useState(selectionsByTrip[tripId] || []);

  const [newType, setNewType] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState("");
  const [editName, setEditName] = useState("");
  const [newMaxCapacity, setNewMaxCapacity] = useState("");
  const [editMaxCapacity, setEditMaxCapacity] = useState("");

  const handleAddSelection = () => {
    if (!newType.trim() || !newName.trim()) {
      alert("Selection type and name are required.");
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
      maxCapacity: capacity,
      registeredCount: 0,
      active: true,
    };

    setSelections([...selections, newSelection]);

    setNewType("");
    setNewName("");
    setNewMaxCapacity("");
  };
  const handleEditClick = (selection) => {
    setEditingId(selection.id);
    setEditType(selection.type);
    setEditName(selection.name);
    setEditMaxCapacity(selection.maxCapacity ?? "");
  };
  const handleDeleteSelection = (id) => {
    const selection = selections.find((selection) => selection.id === id);

    if ((selection.registeredCount ?? 0) > 0) {
      alert(
        `This selection cannot be deleted because ${selection.registeredCount} people are already registered for it.`,
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this selection?",
    );

    if (!confirmed) {
      return;
    }

    const updatedSelections = selections.filter(
      (selection) => selection.id !== id,
    );

    setSelections(updatedSelections);
  };

  const handleSaveEdit = (id) => {
    if (!editType.trim() || !editName.trim()) {
      alert("Selection type and name are required.");
      return;
    }
    const currentSelection = selections.find(
      (selection) => selection.id === id,
    );

    const newCapacity = editMaxCapacity ? Number(editMaxCapacity) : null;

    if (
      newCapacity !== null &&
      newCapacity < (currentSelection.registeredCount ?? 0)
    ) {
      alert(
        `Capacity cannot be lower than the ${currentSelection.registeredCount ?? 0} people already registered.`,
      );
      return;
    }

    const updatedSelections = selections.map((selection) =>
      selection.id === id
        ? {
            ...selection,
            type: editType,
            name: editName,
            maxCapacity: newCapacity,
          }
        : selection,
    );

    setSelections(updatedSelections);
    setEditingId(null);
    setEditMaxCapacity("");
  };
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditType("");
    setEditName("");
    setEditMaxCapacity("");
  };
  const handleToggleActive = (id) => {
    const updatedSelections = selections.map((selection) =>
      selection.id === id
        ? {
            ...selection,
            active: !selection.active,
          }
        : selection,
    );

    setSelections(updatedSelections);
  };

  return (
    <main className="trip-management-page">
      <h1>{trip?.name || "Trip Management"}</h1>
      <p>{trip?.destination}</p>

      <section>
        <h2>Available Trip Selections</h2>

        {selections.map((selection) => (
          <div key={selection.id}>
            {editingId === selection.id ? (
              <>
                <input
                  type="text"
                  value={editType}
                  onChange={(event) => setEditType(event.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Max capacity"
                  value={editMaxCapacity}
                  onChange={(event) => setEditMaxCapacity(event.target.value)}
                />
                <div className="selection-actions">
                  <button onClick={() => handleSaveEdit(selection.id)}>
                    Save
                  </button>

                  <button onClick={handleCancelEdit}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p>
                  <strong>{selection.type}:</strong> {selection.name}
                </p>
                <p>
                  <strong>Capacity:</strong>{" "}
                  {selection.maxCapacity ?? "No limit"}
                </p>
                <p>
                  <strong>Registered:</strong> {selection.registeredCount ?? 0}
                </p>

                <p>
                  <strong>Remaining:</strong>{" "}
                  {selection.maxCapacity
                    ? selection.maxCapacity - (selection.registeredCount ?? 0)
                    : "No limit"}
                </p>

                {selection.maxCapacity &&
                  (selection.registeredCount ?? 0) >= selection.maxCapacity && (
                    <p className="selection-full">FULL</p>
                  )}

                <div className="selection-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEditClick(selection)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => handleDeleteSelection(selection.id)}
                  >
                    Delete
                  </button>
                  <button
                    className={
                      selection.active ? "deactivate-button" : "activate-button"
                    }
                    onClick={() => handleToggleActive(selection.id)}
                  >
                    {selection.active ? "Deactivate" : "Activate"}
                  </button>
                  <p>
                    <strong>Status:</strong>{" "}
                    {selection.active ? "Active" : "Inactive"}
                  </p>
                </div>
              </>
            )}
          </div>
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
