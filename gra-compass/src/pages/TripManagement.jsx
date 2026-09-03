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

  const handleAddSelection = () => {
    if (!newType || !newName) {
      return;
    }

    const newSelection = {
      id: Date.now(),
      type: newType,
      name: newName,
    };

    setSelections([...selections, newSelection]);

    setNewType("");
    setNewName("");
  };

  const handleEditClick = (selection) => {
    setEditingId(selection.id);
    setEditType(selection.type);
    setEditName(selection.name);
  };

  const handleSaveEdit = (id) => {
    const updatedSelections = selections.map((selection) =>
      selection.id === id
        ? {
            ...selection,
            type: editType,
            name: editName,
          }
        : selection,
    );

    setSelections(updatedSelections);
    setEditingId(null);
  };
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditType("");
    setEditName("");
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
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />

                <button onClick={() => handleSaveEdit(selection.id)}>
                  Save
                </button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <p>
                  <strong>{selection.type}:</strong> {selection.name}
                </p>

                <button onClick={() => handleEditClick(selection)}>Edit</button>
              </>
            )}
          </div>
        ))}

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
        <button onClick={handleAddSelection}>Add Selection</button>
      </section>
    </main>
  );
};

export default TripManagement;
