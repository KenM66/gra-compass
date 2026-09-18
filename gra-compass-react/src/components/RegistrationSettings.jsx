import { useState } from "react";

const RegistrationSettings = ({
  registrationCapacity,
  travelerCapacity,
  registrationCloseDate,
  registrationsPaused,
  onSave,
  onCancel,
  onPause,
  onResume,
}) => {
  const [editRegistrationCapacity, setEditRegistrationCapacity] = useState(
    registrationCapacity ?? "",
  );

  const [editTravelerCapacity, setEditTravelerCapacity] = useState(
    travelerCapacity ?? "",
  );

  const [editRegistrationCloseDate, setEditRegistrationCloseDate] = useState(
    registrationCloseDate ?? "",
  );

  return (
    <section className="registration-settings">
      <h2>Registration Settings</h2>

      <div className="registration-settings-field">
        <label htmlFor="registration-capacity">Registration Capacity</label>

        <input
          id="registration-capacity"
          type="number"
          min="1"
          value={editRegistrationCapacity}
          onChange={(event) => setEditRegistrationCapacity(event.target.value)}
        />
      </div>

      <div className="registration-settings-field">
        <label htmlFor="traveler-capacity">Traveler Capacity</label>

        <input
          id="traveler-capacity"
          type="number"
          min="1"
          value={editTravelerCapacity}
          onChange={(event) => setEditTravelerCapacity(event.target.value)}
        />
      </div>

      <div className="registration-settings-field">
        <label htmlFor="registration-close-date">Registration Close Date</label>

        <input
          id="registration-close-date"
          type="date"
          value={editRegistrationCloseDate}
          onChange={(event) => setEditRegistrationCloseDate(event.target.value)}
        />

        <small>Optional — leave blank to close when the trip begins.</small>
      </div>

      <div className="registration-settings-status">
        <strong>
          Registrations are currently {registrationsPaused ? "paused" : "open"}.
        </strong>

        {registrationsPaused ? (
          <button type="button" onClick={onResume}>
            Resume Registrations
          </button>
        ) : (
          <button type="button" onClick={onPause}>
            Pause Registrations
          </button>
        )}
      </div>

      <div className="registration-settings-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>

        <button
          type="button"
          onClick={() =>
            onSave({
              registrationCapacity: editRegistrationCapacity,
              travelerCapacity: editTravelerCapacity,
              registrationCloseDate: editRegistrationCloseDate,
            })
          }
        >
          Save Settings
        </button>
      </div>
    </section>
  );
};

export default RegistrationSettings;
