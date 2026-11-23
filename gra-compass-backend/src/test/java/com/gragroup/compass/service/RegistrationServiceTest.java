package com.gragroup.compass.service;

import com.gragroup.compass.model.ActivitySelection;
import com.gragroup.compass.model.Guest;
import com.gragroup.compass.model.Registration;
import com.gragroup.compass.repository.RegistrationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

class RegistrationServiceTest {

        private RegistrationRepository registrationRepository;
        private RegistrationService registrationService;

        @BeforeEach
        void setUp() {
                registrationRepository = Mockito.mock(RegistrationRepository.class);
                registrationService = new RegistrationService(registrationRepository);
        }

        @Test
        void updatesRegistrationWithoutChangingIdentityFields() {
                Registration existingRegistration = new Registration();
                existingRegistration.setId("registration123");
                existingRegistration.setTripId("trip123");
                existingRegistration.setTravelerNumber(1047);
                existingRegistration.setFirstName("Robert");
                existingRegistration.setLastName("Henderson");
                existingRegistration.setEmail("old@example.com");

                Registration updatedRegistration = new Registration();
                updatedRegistration.setId("differentRegistration");
                updatedRegistration.setTripId("differentTrip");
                updatedRegistration.setTravelerNumber(9999);
                updatedRegistration.setFirstName("Bob");
                updatedRegistration.setLastName("Henderson");
                updatedRegistration.setEmail("bob@example.com");

                when(registrationRepository.findByTripIdAndTravelerNumber(
                                "trip123", 1047))
                                .thenReturn(Optional.of(existingRegistration));

                when(registrationRepository.save(existingRegistration))
                                .thenReturn(existingRegistration);

                Optional<Registration> result = registrationService.updateRegistration(
                                "trip123",
                                1047,
                                updatedRegistration);

                assertTrue(result.isPresent());

                Registration savedRegistration = result.get();

                assertEquals("registration123", savedRegistration.getId());
                assertEquals("trip123", savedRegistration.getTripId());
                assertEquals(1047, savedRegistration.getTravelerNumber());

                assertEquals("Bob", savedRegistration.getFirstName());
                assertEquals("Henderson", savedRegistration.getLastName());
                assertEquals("bob@example.com", savedRegistration.getEmail());

                verify(registrationRepository)
                                .findByTripIdAndTravelerNumber("trip123", 1047);

                verify(registrationRepository).save(existingRegistration);
        }

        @Test
        void shouldRejectTravelerActivitySessionChange() {

                String tripId = "test-trip";
                int travelerNumber = 1;

                ActivitySelection existingSelection = new ActivitySelection();
                existingSelection.setActivityId("activity-123");
                existingSelection.setSessionId(1);

                Registration existing = new Registration();
                existing.setActivities(List.of(existingSelection));

                ActivitySelection changedSelection = new ActivitySelection();
                changedSelection.setActivityId("activity-123");
                changedSelection.setSessionId(2);

                Registration updated = new Registration();
                updated.setActivities(List.of(changedSelection));

                Mockito.when(registrationRepository.findByTripIdAndTravelerNumber(
                                tripId, travelerNumber)).thenReturn(Optional.of(existing));

                assertThrows(
                                IllegalArgumentException.class,
                                () -> registrationService.updateRegistration(
                                                tripId, travelerNumber, updated));

                Mockito.verify(registrationRepository, Mockito.never())
                                .save(Mockito.any(Registration.class));
        }

        @Test
        void shouldRejectGuestActivitySessionChange() {

                String tripId = "test-trip";
                int travelerNumber = 1;

                ActivitySelection existingSelection = new ActivitySelection();
                existingSelection.setActivityId("activity-123");
                existingSelection.setSessionId(1);

                Guest existingGuest = new Guest();
                existingGuest.setActivities(List.of(existingSelection));

                Registration existing = new Registration();
                existing.setBringingGuest(true);
                existing.setGuest(existingGuest);

                ActivitySelection changedSelection = new ActivitySelection();
                changedSelection.setActivityId("activity-123");
                changedSelection.setSessionId(2);

                Guest updatedGuest = new Guest();
                updatedGuest.setActivities(List.of(changedSelection));

                Registration updated = new Registration();
                updated.setBringingGuest(true);
                updated.setGuest(updatedGuest);

                Mockito.when(registrationRepository.findByTripIdAndTravelerNumber(
                                tripId, travelerNumber)).thenReturn(Optional.of(existing));

                assertThrows(
                                IllegalArgumentException.class,
                                () -> registrationService.updateRegistration(
                                                tripId, travelerNumber, updated));

                Mockito.verify(registrationRepository, Mockito.never())
                                .save(Mockito.any(Registration.class));
        }

        @Test
        void shouldRejectRemovingGuestWithActivityReservations() {

                String tripId = "test-trip";
                int travelerNumber = 1;

                ActivitySelection selection = new ActivitySelection();
                selection.setActivityId("activity-123");
                selection.setSessionId(1);

                Guest existingGuest = new Guest();
                existingGuest.setActivities(List.of(selection));

                Registration existing = new Registration();
                existing.setBringingGuest(true);
                existing.setGuest(existingGuest);

                Registration updated = new Registration();
                updated.setBringingGuest(false);
                updated.setGuest(existingGuest);

                Mockito.when(registrationRepository.findByTripIdAndTravelerNumber(
                                tripId, travelerNumber)).thenReturn(Optional.of(existing));

                assertThrows(
                                IllegalArgumentException.class,
                                () -> registrationService.updateRegistration(
                                                tripId, travelerNumber, updated));

                Mockito.verify(registrationRepository, Mockito.never())
                                .save(Mockito.any(Registration.class));
        }

        @Test
        void shouldAllowOrdinaryRegistrationUpdate() {

                String tripId = "test-trip";
                int travelerNumber = 1;

                ActivitySelection selection = new ActivitySelection();
                selection.setActivityId("activity-123");
                selection.setSessionId(1);

                Registration existing = new Registration();
                existing.setFirstName("John");
                existing.setActivities(List.of(selection));

                Registration updated = new Registration();
                updated.setFirstName("Johnny");
                updated.setActivities(List.of(selection));

                Mockito.when(registrationRepository.findByTripIdAndTravelerNumber(
                                tripId, travelerNumber)).thenReturn(Optional.of(existing));

                Mockito.when(registrationRepository.save(
                                Mockito.any(Registration.class))).thenAnswer(invocation -> invocation.getArgument(0));

                Optional<Registration> result = registrationService.updateRegistration(
                                tripId, travelerNumber, updated);

                assertTrue(result.isPresent());
                assertEquals("Johnny", result.get().getFirstName());

                Mockito.verify(registrationRepository)
                                .save(Mockito.any(Registration.class));
        }

}