const SelectionCard = ({
    selection,

    selectedSessionIds,
    setSelectedSessionIds,

    editingId,
    editSessionDate,
    setEditSessionDate,
    editSessionTime,
    setEditSessionTime,
    editMaxCapacity,
    setEditMaxCapacity,
    handleSaveEdit,
    handleCancelEdit,

    editingSelectionId,
    setEditingSelectionId,
    editSelectionType,
    setEditSelectionType,
    editSelectionName,
    setEditSelectionName,
    handleSaveSelectionEdit,

    handleEditClick,
    handleDeleteSelection,
    handleToggleActive,

    addingSessionToId,
    setAddingSessionToId,
    additionalSessionDate,
    setAdditionalSessionDate,
    additionalSessionTime,
    setAdditionalSessionTime,
    additionalSessionCapacity,
    setAdditionalSessionCapacity,
    handleAddSession,
}) => {
    const selectedSessionId =
        selectedSessionIds[selection.id] ??
        selection.sessions?.[0]?.id;

    const selectedSession = selection.sessions?.find(
        (session) => session.id === selectedSessionId
    );

    return (
        <div className="selection-card">
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
                            onClick={() =>
                                handleSaveSelectionEdit(selection.id)
                            }
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
                        <strong>{selection.type}:</strong>{" "}
                        {selection.name}
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
            )}  </>
)}
        </div>
    );

};

export default SelectionCard;