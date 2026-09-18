const RegistrationSummary = ({
  status,
  registrationCount,
  travelerCount,
  registrationCloseDate,
  onEditSettings,
}) => {
  const formattedRegistrationCloseDate = registrationCloseDate
    ? new Date(`${registrationCloseDate}T00:00:00`).toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        },
      )
    : "No close date set";
  return (
    <section className="registration-summary">
      <div className="registration-summary-header">
        <h2>Registration Summary</h2>

        <div className="registration-summary-header-actions">
          <button
            type="button"
            className="edit-trip-button"
            onClick={onEditSettings}
          >
            Edit Settings
          </button>

          <span
            className={`registration-summary-status-badge registration-summary-status-${status
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            <span className="registration-summary-status-dot"></span>
            {status}
          </span>
        </div>
      </div>

      <div className="registration-summary-counts">
        <div>
          <span>Registrations</span>
          <strong>{registrationCount}</strong>
        </div>

        <div>
          <span>Total Travelers</span>
          <strong>{travelerCount}</strong>
          <small>Including guests</small>
        </div>
      </div>

      <p className="registration-summary-close-date">
        Registration closes: <strong>{formattedRegistrationCloseDate}</strong>
      </p>
    </section>
  );
};

export default RegistrationSummary;
