import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Registrations from "./pages/Registrations";
import RegistrationDetails from "./pages/RegistrationDetails";
import GuestDetails from "./pages/GuestDetails";
import Reports from "./pages/Reports";
import RegistrationReport from "./pages/RegistrationReport";
import AccessibilityReport from "./pages/AccessibilityReport";
import DietaryReport from "./pages/DietaryReport";
import ActivitySessionReport from "./pages/ActivitySessionReport";
import FlightBookingReport from "./pages/FlightBookingReport";
import Settings from "./pages/Settings";
import TripManagement from "./pages/TripManagement";
import CreateTrip from "./pages/CreateTrip";
import { useState } from "react";
import tripsData from "./data/mockTrips";
import registrationsData from "./data/mockRegistrations";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import EmailAddressReport from "./pages/EmailAddressReport";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("isAuthenticated") === "true",
  );

  const [trips, setTrips] = useState(tripsData);

  const [registrationsByTrip, setRegistrationsByTrip] =
    useState(registrationsData);

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}

      <Routes>
        <Route
          path="/trips/:tripId/registrations"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Registrations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips/:tripId/registrations/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <RegistrationDetails
                registrationsByTrip={registrationsByTrip}
                setRegistrationsByTrip={setRegistrationsByTrip}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips/:tripId/registrations/:id/guest"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <GuestDetails
                registrationsByTrip={registrationsByTrip}
                setRegistrationsByTrip={setRegistrationsByTrip}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/activity-sessions"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ActivitySessionReport
                registrationsByTrip={registrationsByTrip}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/registrations"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <RegistrationReport registrationsByTrip={registrationsByTrip} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/accessibility"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AccessibilityReport registrationsByTrip={registrationsByTrip} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/dietary"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DietaryReport registrationsByTrip={registrationsByTrip} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/flight-booking"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <FlightBookingReport registrationsByTrip={registrationsByTrip} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/email-addresses"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EmailAddressReport registrationsByTrip={registrationsByTrip} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <Login
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId/manage"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TripManagement
                trips={trips}
                setTrips={setTrips}
                registrationsByTrip={registrationsByTrip}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips/create"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CreateTrip setTrips={setTrips} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard
                trips={trips}
                registrationsByTrip={registrationsByTrip}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
