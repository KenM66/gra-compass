import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AccessibilityReportBuilder = ({ tripId }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerateReport = () => {
    navigate(`/reports/accessibility?tripId=${tripId}`);
  };

  return (
    <section className="reports-schedule">
      <button
        type="button"
        className="reports-section-toggle"
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
        aria-expanded={isOpen}
      >
        <span>Accessibility Needs Report</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="reports-section-content">
          <p>
            Generate a list of travelers who reported accessibility needs for
            this trip.
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

export default AccessibilityReportBuilder;
