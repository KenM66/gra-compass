import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MailingLabelReportBuilder({ tripId }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleGenerateReport = () => {
        navigate(`/reports/mailing-labels?tripId=${tripId}`);
    };

    return (
        <section className="reports-schedule">
            <button
                type="button"
                className="reports-section-toggle"
                onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
                aria-expanded={isOpen}
            >
                <span>Mailing Labels</span>
                <span>{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
                <div className="reports-section-content">
                    <p>
                        Generate mailing names and addresses for this trip for export to
                        Avery.
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

export default MailingLabelReportBuilder;