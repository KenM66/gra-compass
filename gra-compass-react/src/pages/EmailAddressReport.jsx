import { useSearchParams } from "react-router-dom";
import "../styles/EmailAddressReport.css";

const EmailAddressReport = ({ registrationsByTrip }) => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");
  const tripRegistrations = registrationsByTrip[tripId] ?? [];
  const emailAddresses = [
    ...tripRegistrations.map((registration) => registration.email),
    ...tripRegistrations.map((registration) => registration.guest?.email),
  ]
    .filter(Boolean)
    .filter((email, index, emails) => emails.indexOf(email) === index)
    .join(", ");

  return (
    <main className="email-address-report">
      <div className="email-address-card">
        <div className="email-address-card-header">
          <h1>E-Mail Address List</h1>
        </div>

        <div className="email-address-card-content">
          <p>{emailAddresses}</p>
        </div>
      </div>
    </main>
  );
};

export default EmailAddressReport;
