import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegistrationReportBuilder = ({ tripId }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerateReport = () => {
    navigate(`/reports/registrations?tripId=${tripId}`);
  };

  return (
    <section className="reports-schedule">
      <button
        type="button"
        className="reports-section-toggle"
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
        aria-expanded={isOpen}
      >
        <span>Registration Report</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="reports-section-content">
          <p>
            Generate a contact list of all registrations for this trip,
            including primary traveler and guest information.
          </p>

          <div className="reports-actions">
            <button type="button" onClick={handleGenerateReport}>
              Generate Report
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default RegistrationReportBuilder;
