import { useState } from "react";
import { useNavigate } from "react-router-dom";

function EmailAddressReportBuilder({ tripId }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerateReport = () => {
    navigate(`/reports/email-addresses?tripId=${tripId}`);
  };

  return (
    <section className="reports-schedule">
      <button
        type="button"
        className="reports-section-toggle"
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
        aria-expanded={isOpen}
      >
        <span>E-Mail Address List</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="reports-section-content">
          <p>
            Generate a comma-separated list of primary traveler and guest email
            addresses for this trip.
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
}

export default EmailAddressReportBuilder;
