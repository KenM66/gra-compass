import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Registrations from "./pages/Registrations";
import RegistrationDetails from "./pages/RegistrationDetails";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import TripManagement from "./pages/TripManagement";
import CreateTrip from "./pages/CreateTrip";
import { useState } from "react";
import tripsData from "./data/mockTrips";

const App = () => {
  const [trips, setTrips] = useState(tripsData);

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
          element={<RegistrationDetails />}
        />

        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/trips/:tripId/manage"
          element={<TripManagement trips={trips} setTrips={setTrips} />}
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
