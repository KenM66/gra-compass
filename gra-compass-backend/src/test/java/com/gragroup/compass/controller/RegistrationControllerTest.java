package com.gragroup.compass.controller;

import com.gragroup.compass.model.Registration;
import com.gragroup.compass.service.RegistrationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.gragroup.compass.service.GuestActivityReservationRetryService;
import com.gragroup.compass.service.TravelerActivityReservationRetryService;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.NoSuchElementException;

@WebMvcTest(RegistrationController.class)
class RegistrationControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private RegistrationService registrationService;

        @MockitoBean
        private GuestActivityReservationRetryService guestActivityReservationRetryService;

        @MockitoBean
        private TravelerActivityReservationRetryService travelerActivityReservationRetryService;

        @Test
        void updatesRegistration() throws Exception {
                Registration updatedRegistration = new Registration();
                updatedRegistration.setId("registration123");
                updatedRegistration.setTripId("trip123");
                updatedRegistration.setTravelerNumber(1047);
                updatedRegistration.setFirstName("Bob");
                updatedRegistration.setLastName("Henderson");
                updatedRegistration.setEmail("bob@example.com");

                when(registrationService.updateRegistration(
                                org.mockito.ArgumentMatchers.eq("trip123"),
                                org.mockito.ArgumentMatchers.eq(1047),
                                any(Registration.class)))
                                .thenReturn(Optional.of(updatedRegistration));

                mockMvc.perform(put("/api/trips/trip123/registrations/1047")
                                .contentType("application/json")
                                .content("""
                                                {
                                                  "firstName": "Bob",
                                                  "lastName": "Henderson",
                                                  "email": "bob@example.com"
                                                }
                                                """))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value("registration123"))
                                .andExpect(jsonPath("$.tripId").value("trip123"))
                                .andExpect(jsonPath("$.travelerNumber").value(1047))
                                .andExpect(jsonPath("$.firstName").value("Bob"))
                                .andExpect(jsonPath("$.lastName").value("Henderson"))
                                .andExpect(jsonPath("$.email").value("bob@example.com"));
        }

        @Test
        void reservesGuestActivity() throws Exception {
                Registration registration = new Registration();
                registration.setId("registration123");
                registration.setTripId("trip123");
                registration.setTravelerNumber(1047);

                when(guestActivityReservationRetryService.reserveGuestActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenReturn(registration);

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/guest/activities/activity123/sessions/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value("registration123"))
                                .andExpect(jsonPath("$.tripId").value("trip123"))
                                .andExpect(jsonPath("$.travelerNumber").value(1047));
        }

        @Test
        void returnsNotFoundWhenGuestActivityDoesNotExist() throws Exception {

                when(guestActivityReservationRetryService.reserveGuestActivity(
                                "trip123", 1047, "missingActivity", 1))
                                .thenThrow(new NoSuchElementException("Activity not found"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/guest/activities/missingActivity/sessions/1"))
                                .andExpect(status().isNotFound());
        }

        @Test
        void returnsBadRequestWhenRegistrationHasNoGuest() throws Exception {

                when(guestActivityReservationRetryService.reserveGuestActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenThrow(new IllegalArgumentException(
                                                "Registration does not have a guest"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/guest/activities/activity123/sessions/1"))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void returnsConflictWhenActivitySessionIsFull() throws Exception {

                when(guestActivityReservationRetryService.reserveGuestActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenThrow(new IllegalStateException(
                                                "Activity session is full, inactive, or unavailable"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/guest/activities/activity123/sessions/1"))
                                .andExpect(status().isConflict());
        }

        @Test
        void reservesTravelerActivity() throws Exception {
                Registration registration = new Registration();
                registration.setId("registration123");
                registration.setTripId("trip123");
                registration.setTravelerNumber(1047);

                when(travelerActivityReservationRetryService.reserveTravelerActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenReturn(registration);

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/activities/activity123/sessions/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value("registration123"))
                                .andExpect(jsonPath("$.tripId").value("trip123"))
                                .andExpect(jsonPath("$.travelerNumber").value(1047));
        }

        @Test
        void returnsNotFoundWhenTravelerActivityDoesNotExist() throws Exception {

                when(travelerActivityReservationRetryService.reserveTravelerActivity(
                                "trip123", 1047, "missingActivity", 1))
                                .thenThrow(new NoSuchElementException("Activity not found"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/activities/missingActivity/sessions/1"))
                                .andExpect(status().isNotFound());
        }

        @Test
        void returnsBadRequestWhenTravelerReservationIsInvalid() throws Exception {

                when(travelerActivityReservationRetryService.reserveTravelerActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenThrow(new IllegalArgumentException("Invalid reservation"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/activities/activity123/sessions/1"))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void returnsConflictWhenTravelerActivitySessionIsUnavailable() throws Exception {

                when(travelerActivityReservationRetryService.reserveTravelerActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenThrow(new IllegalStateException(
                                                "Activity session is full, inactive, or unavailable"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/activities/activity123/sessions/1"))
                                .andExpect(status().isConflict());
        }

        @Test
        void cancelsTravelerActivity() throws Exception {

                Registration registration = new Registration();
                registration.setId("registration123");
                registration.setTripId("trip123");
                registration.setTravelerNumber(1047);

                when(travelerActivityReservationRetryService.cancelTravelerActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenReturn(registration);

                mockMvc.perform(delete(
                                "/api/trips/trip123/registrations/1047/activities/activity123/sessions/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value("registration123"))
                                .andExpect(jsonPath("$.tripId").value("trip123"))
                                .andExpect(jsonPath("$.travelerNumber").value(1047));
        }

        @Test
        void returnsNotFoundWhenTravelerCancellationReservationDoesNotExist()
                        throws Exception {

                when(travelerActivityReservationRetryService.cancelTravelerActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenThrow(new NoSuchElementException(
                                                "Traveler activity reservation not found"));

                mockMvc.perform(delete(
                                "/api/trips/trip123/registrations/1047/activities/activity123/sessions/1"))
                                .andExpect(status().isNotFound());
        }

        @Test
        void returnsBadRequestWhenTravelerCancellationIsInvalid()
                        throws Exception {

                when(travelerActivityReservationRetryService.cancelTravelerActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenThrow(new IllegalArgumentException(
                                                "Invalid cancellation"));

                mockMvc.perform(delete(
                                "/api/trips/trip123/registrations/1047/activities/activity123/sessions/1"))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void returnsConflictWhenTravelerCancellationFails()
                        throws Exception {

                when(travelerActivityReservationRetryService.cancelTravelerActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenThrow(new IllegalStateException(
                                                "Reserved seat could not be released"));

                mockMvc.perform(delete(
                                "/api/trips/trip123/registrations/1047/activities/activity123/sessions/1"))
                                .andExpect(status().isConflict());
        }

        // =====================================================
        // GUEST CANCELLATION TESTS
        // =====================================================

        @Test
        void cancelsGuestActivity() throws Exception {

                Registration registration = new Registration();
                registration.setId("registration123");
                registration.setTripId("trip123");
                registration.setTravelerNumber(1047);

                when(guestActivityReservationRetryService.cancelGuestActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenReturn(registration);

                mockMvc.perform(delete(
                                "/api/trips/trip123/registrations/1047/guest/activities/activity123/sessions/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value("registration123"))
                                .andExpect(jsonPath("$.tripId").value("trip123"))
                                .andExpect(jsonPath("$.travelerNumber").value(1047));

                verify(guestActivityReservationRetryService)
                                .cancelGuestActivity(
                                                "trip123", 1047, "activity123", 1);

                verifyNoMoreInteractions(guestActivityReservationRetryService);
        }

        @Test
        void returnsNotFoundWhenGuestCancellationReservationDoesNotExist()
                        throws Exception {

                when(guestActivityReservationRetryService.cancelGuestActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenThrow(new NoSuchElementException(
                                                "Guest activity reservation not found"));

                mockMvc.perform(delete(
                                "/api/trips/trip123/registrations/1047/guest/activities/activity123/sessions/1"))
                                .andExpect(status().isNotFound());

                verify(guestActivityReservationRetryService)
                                .cancelGuestActivity(
                                                "trip123", 1047, "activity123", 1);
        }

        @Test
        void returnsBadRequestWhenGuestCancellationIsInvalid()
                        throws Exception {

                when(guestActivityReservationRetryService.cancelGuestActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenThrow(new IllegalArgumentException(
                                                "Registration does not have a guest"));

                mockMvc.perform(delete(
                                "/api/trips/trip123/registrations/1047/guest/activities/activity123/sessions/1"))
                                .andExpect(status().isBadRequest());

                verify(guestActivityReservationRetryService)
                                .cancelGuestActivity(
                                                "trip123", 1047, "activity123", 1);
        }

        @Test
        void returnsConflictWhenGuestCancellationFails()
                        throws Exception {

                when(guestActivityReservationRetryService.cancelGuestActivity(
                                "trip123", 1047, "activity123", 1))
                                .thenThrow(new IllegalStateException(
                                                "Reserved seat could not be released"));

                mockMvc.perform(delete(
                                "/api/trips/trip123/registrations/1047/guest/activities/activity123/sessions/1"))
                                .andExpect(status().isConflict());

                verify(guestActivityReservationRetryService)
                                .cancelGuestActivity(
                                                "trip123", 1047, "activity123", 1);
        }

        // =====================================================
        // TRAVELER SESSION SWITCHING TESTS
        // =====================================================

        @Test
        void switchesTravelerActivitySession() throws Exception {

                Registration registration = new Registration();
                registration.setId("registration123");
                registration.setTripId("trip123");
                registration.setTravelerNumber(1047);

                when(travelerActivityReservationRetryService
                                .switchTravelerActivitySession(
                                                "trip123", 1047, "activity123", 1, 2))
                                .thenReturn(registration);

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/activities/activity123/sessions/1/switch/2"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value("registration123"))
                                .andExpect(jsonPath("$.tripId").value("trip123"))
                                .andExpect(jsonPath("$.travelerNumber").value(1047));

                verify(travelerActivityReservationRetryService)
                                .switchTravelerActivitySession(
                                                "trip123", 1047, "activity123", 1, 2);

                verifyNoMoreInteractions(travelerActivityReservationRetryService);
                verifyNoMoreInteractions(guestActivityReservationRetryService);
        }

        @Test
        void returnsNotFoundWhenTravelerSessionSwitchReservationDoesNotExist()
                        throws Exception {

                when(travelerActivityReservationRetryService
                                .switchTravelerActivitySession(
                                                "trip123", 1047, "activity123", 1, 2))
                                .thenThrow(new NoSuchElementException(
                                                "Traveler activity reservation not found"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/activities/activity123/sessions/1/switch/2"))
                                .andExpect(status().isNotFound());

                verify(travelerActivityReservationRetryService)
                                .switchTravelerActivitySession(
                                                "trip123", 1047, "activity123", 1, 2);
        }

        @Test
        void returnsBadRequestWhenTravelerSwitchUsesIdenticalSessionIds()
                        throws Exception {

                when(travelerActivityReservationRetryService
                                .switchTravelerActivitySession(
                                                "trip123", 1047, "activity123", 1, 1))
                                .thenThrow(new IllegalArgumentException(
                                                "Replacement session must differ from current session"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/activities/activity123/sessions/1/switch/1"))
                                .andExpect(status().isBadRequest());

                verify(travelerActivityReservationRetryService)
                                .switchTravelerActivitySession(
                                                "trip123", 1047, "activity123", 1, 1);
        }

        @Test
        void returnsConflictWhenTravelerReplacementSessionIsUnavailable()
                        throws Exception {

                when(travelerActivityReservationRetryService
                                .switchTravelerActivitySession(
                                                "trip123", 1047, "activity123", 1, 2))
                                .thenThrow(new IllegalStateException(
                                                "Activity session is full, inactive, or unavailable"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/activities/activity123/sessions/1/switch/2"))
                                .andExpect(status().isConflict());

                verify(travelerActivityReservationRetryService)
                                .switchTravelerActivitySession(
                                                "trip123", 1047, "activity123", 1, 2);
        }

        // =====================================================
        // GUEST SESSION SWITCHING TESTS
        // =====================================================

        @Test
        void switchesGuestActivitySession() throws Exception {

                Registration registration = new Registration();
                registration.setId("registration123");
                registration.setTripId("trip123");
                registration.setTravelerNumber(1047);

                when(guestActivityReservationRetryService
                                .switchGuestActivitySession(
                                                "trip123", 1047, "activity123", 1, 2))
                                .thenReturn(registration);

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/guest/activities/activity123/sessions/1/switch/2"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value("registration123"))
                                .andExpect(jsonPath("$.tripId").value("trip123"))
                                .andExpect(jsonPath("$.travelerNumber").value(1047));

                verify(guestActivityReservationRetryService)
                                .switchGuestActivitySession(
                                                "trip123", 1047, "activity123", 1, 2);

                verifyNoMoreInteractions(guestActivityReservationRetryService);
                verifyNoMoreInteractions(travelerActivityReservationRetryService);
        }

        @Test
        void returnsNotFoundWhenGuestSessionSwitchReservationDoesNotExist()
                        throws Exception {

                when(guestActivityReservationRetryService
                                .switchGuestActivitySession(
                                                "trip123", 1047, "activity123", 1, 2))
                                .thenThrow(new NoSuchElementException(
                                                "Guest activity reservation not found"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/guest/activities/activity123/sessions/1/switch/2"))
                                .andExpect(status().isNotFound());

                verify(guestActivityReservationRetryService)
                                .switchGuestActivitySession(
                                                "trip123", 1047, "activity123", 1, 2);
        }

        @Test
        void returnsBadRequestWhenGuestSwitchUsesIdenticalSessionIds()
                        throws Exception {

                when(guestActivityReservationRetryService
                                .switchGuestActivitySession(
                                                "trip123", 1047, "activity123", 1, 1))
                                .thenThrow(new IllegalArgumentException(
                                                "Replacement session must differ from current session"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/guest/activities/activity123/sessions/1/switch/1"))
                                .andExpect(status().isBadRequest());

                verify(guestActivityReservationRetryService)
                                .switchGuestActivitySession(
                                                "trip123", 1047, "activity123", 1, 1);
        }

        @Test
        void returnsConflictWhenGuestReplacementSessionIsUnavailable()
                        throws Exception {

                when(guestActivityReservationRetryService
                                .switchGuestActivitySession(
                                                "trip123", 1047, "activity123", 1, 2))
                                .thenThrow(new IllegalStateException(
                                                "Activity session is full, inactive, or unavailable"));

                mockMvc.perform(put(
                                "/api/trips/trip123/registrations/1047/guest/activities/activity123/sessions/1/switch/2"))
                                .andExpect(status().isConflict());

                verify(guestActivityReservationRetryService)
                                .switchGuestActivitySession(
                                                "trip123", 1047, "activity123", 1, 2);
        }
}