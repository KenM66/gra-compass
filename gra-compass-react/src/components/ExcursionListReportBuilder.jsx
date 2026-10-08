import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ExcursionListReportBuilder({ tripId }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleGenerateReport = () => {
        navigate(`/reports/excursion-list?tripId=${tripId}`);
    };

    return (
        <section className="reports-schedule">
            <button
                type="button"
                className="reports-section-toggle"
                onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
                aria-expanded={isOpen}
            >
                <span>Excursion List by Traveler</span>
                <span>{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
                <div className="reports-section-content">
                    <p>
                        Generate a list of travelers and guests with their
                        selected excursions.
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

export default ExcursionListReportBuilder;