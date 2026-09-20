import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Registrations from "./pages/Registrations";
import RegistrationDetails from "./pages/RegistrationDetails";
import GuestDetails from "./pages/GuestDetails";
import Reports from "./pages/Reports";
import ActivitySessionReport from "./pages/ActivitySessionReport";
import Settings from "./pages/Settings";
import TripManagement from "./pages/TripManagement";
import CreateTrip from "./pages/CreateTrip";
import { useState } from "react";
import tripsData from "./data/mockTrips";
import registrationsData from "./data/mockRegistrations";

const App = () => {
  const [trips, setTrips] = useState(tripsData);

  const [registrationsByTrip, setRegistrationsByTrip] =
    useState(registrationsData);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/trips/:tripId/registrations"
          element={<Registrations />}
        />

        <Route
          path="/trips/:tripId/registrations/:id"
          element={
            <RegistrationDetails
              registrationsByTrip={registrationsByTrip}
              setRegistrationsByTrip={setRegistrationsByTrip}
            />
          }
        />

        <Route
          path="/trips/:tripId/registrations/:id/guest"
          element={
            <GuestDetails
              registrationsByTrip={registrationsByTrip}
              setRegistrationsByTrip={setRegistrationsByTrip}
            />
          }
        />

        <Route path="/reports" element={<Reports />} />
        <Route
          path="/reports/activity-sessions"
          element={
            <ActivitySessionReport registrationsByTrip={registrationsByTrip} />
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/trips/:tripId/manage"
          element={
            <TripManagement
              trips={trips}
              setTrips={setTrips}
              registrationsByTrip={registrationsByTrip}
            />
          }
        />

        <Route
          path="/trips/create"
          element={<CreateTrip setTrips={setTrips} />}
        />
        <Route path="/" element={<Dashboard trips={trips} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
