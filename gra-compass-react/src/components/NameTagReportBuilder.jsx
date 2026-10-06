import { useState } from "react";
import { useNavigate } from "react-router-dom";

function NameTagReportBuilder({ tripId }) {

    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleGenerateReport = () => {
        navigate(`/reports/name-tags?tripId=${tripId}`);
    };

    return (
        <section className="reports-schedule">
            <button
                type="button"
                className="reports-section-toggle"
                onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
                aria-expanded={isOpen}
            >
                <span>Name Tag List</span>
                <span>{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
                <div className="reports-section-content">
                    <p>
                        Generate a name tag list showing each attendee's preferred
                        or first name, last name, and role.
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

export default NameTagReportBuilder;