package com.gragroup.compass.service;

import com.gragroup.compass.dto.CreateActivityRequest;
import com.gragroup.compass.model.Activity;
import com.gragroup.compass.model.ActivitySelection;
import com.gragroup.compass.repository.ActivityRepository;
import com.gragroup.compass.repository.TripRepository;
import com.gragroup.compass.repository.RegistrationRepository;
import com.gragroup.compass.dto.CreateActivitySessionRequest;
import com.gragroup.compass.model.ActivitySession;
import com.gragroup.compass.model.Guest;
import com.gragroup.compass.model.Registration;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.NoSuchElementException;
import java.util.ArrayList;
import java.util.List;

class ActivityServiceTest {

        private ActivityRepository activityRepository;
        private TripRepository tripRepository;
        private SessionIdService sessionIdService;
        private ActivityService activityService;
        private RegistrationRepository registrationRepository;
        private ActivitySessionPersistenceService sessionPersistenceService;

        @BeforeEach
        void setUp() {
                activityRepository = Mockito.mock(ActivityRepository.class);
                tripRepository = Mockito.mock(TripRepository.class);
                registrationRepository = Mockito.mock(RegistrationRepository.class);
                sessionIdService = Mockito.mock(SessionIdService.class);

                sessionPersistenceService = Mockito.mock(ActivitySessionPersistenceService.class);

                activityService = new ActivityService(
                                activityRepository,
                                tripRepository,
                                registrationRepository,
                                sessionIdService,
                                sessionPersistenceService);
        }

        @Test
        void createsActivityForExistingTrip() {
                String tripId = "trip123";

                CreateActivityRequest request = new CreateActivityRequest();
                request.setType("Excursion");
                request.setName("Catamaran & Snorkeling");

                when(tripRepository.existsById(tripId)).thenReturn(true);

                when(activityRepository.save(any(Activity.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                Activity result = activityService.createActivity(tripId, request);

                assertNull(result.getId());
                assertEquals(tripId, result.getTripId());
                assertEquals("Excursion", result.getType());
                assertEquals("Catamaran & Snorkeling", result.getName());
                assertNotNull(result.getSessions());
                assertTrue(result.getSessions().isEmpty());

                verify(tripRepository).existsById(tripId);
                verify(activityRepository).save(any(Activity.class));
        }

        @Test
        void updatesActivitySessionCapacity() {
                String tripId = "trip123";
                String activityId = "activity456";
                int sessionId = 1;

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                ActivitySession session = new ActivitySession();
                session.setId(sessionId);
                session.setMaxCapacity(20);
                session.setReservedCount(5);

                activity.setSessions(List.of(session));

                ActivitySession updatedSession = new ActivitySession();
                updatedSession.setMaxCapacity(30);

                ActivitySession persistedSession = new ActivitySession();
                persistedSession.setId(sessionId);
                persistedSession.setMaxCapacity(30);
                persistedSession.setReservedCount(5);

                Activity persistedActivity = new Activity();
                persistedActivity.setId(activityId);
                persistedActivity.setTripId(tripId);
                persistedActivity.setSessions(List.of(persistedSession));

                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.of(activity));

                when(registrationRepository.findByTripId(tripId))
                                .thenReturn(List.of());

                when(sessionPersistenceService.updateSession(
                                tripId, activityId, sessionId, updatedSession))
                                .thenReturn(Optional.of(persistedActivity));

                Activity result = activityService.updateActivitySession(
                                tripId, activityId, sessionId, updatedSession);

                assertEquals(30, result.getSessions().getFirst().getMaxCapacity());
                assertEquals(5, result.getSessions().getFirst().getReservedCount());

                verify(sessionPersistenceService).updateSession(
                                tripId, activityId, sessionId, updatedSession);

                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void rejectsActivityCreationWhenTripDoesNotExist() {
                String tripId = "missingTrip";

                CreateActivityRequest request = new CreateActivityRequest();
                request.setType("Excursion");
                request.setName("Catamaran & Snorkeling");

                when(tripRepository.existsById(tripId)).thenReturn(false);

                NoSuchElementException exception = assertThrows(
                                NoSuchElementException.class,
                                () -> activityService.createActivity(tripId, request));

                assertEquals("Trip not found: missingTrip", exception.getMessage());

                verify(tripRepository).existsById(tripId);
                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void getsActivitiesForExistingTrip() {
                String tripId = "trip123";

                Activity excursion = new Activity();
                excursion.setId("activity123");
                excursion.setTripId(tripId);
                excursion.setType("Excursion");
                excursion.setName("Catamaran & Snorkeling");

                Activity spa = new Activity();
                spa.setId("activity456");
                spa.setTripId(tripId);
                spa.setType("Spa");
                spa.setName("Massage Appointment");

                when(tripRepository.existsById(tripId)).thenReturn(true);

                when(activityRepository.findByTripId(tripId))
                                .thenReturn(List.of(excursion, spa));

                List<Activity> result = activityService.getActivitiesByTripId(tripId);

                assertEquals(2, result.size());
                assertEquals("Catamaran & Snorkeling", result.get(0).getName());
                assertEquals("Massage Appointment", result.get(1).getName());

                verify(tripRepository).existsById(tripId);
                verify(activityRepository).findByTripId(tripId);
        }

        @Test
        void rejectsActivityRetrievalWhenTripDoesNotExist() {
                String tripId = "missingTrip";

                when(tripRepository.existsById(tripId)).thenReturn(false);

                NoSuchElementException exception = assertThrows(
                                NoSuchElementException.class,
                                () -> activityService.getActivitiesByTripId(tripId));

                assertEquals("Trip not found: missingTrip", exception.getMessage());

                verify(tripRepository).existsById(tripId);
                verify(activityRepository, never()).findByTripId(anyString());
        }

        @Test
        void createsSessionForExistingActivity() {
                String tripId = "trip123";
                String activityId = "activity456";

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);
                activity.setName("Catamaran & Snorkeling");

                CreateActivitySessionRequest request = new CreateActivitySessionRequest();

                request.setDate(LocalDate.of(2027, 3, 9));
                request.setTime(LocalTime.of(10, 0));
                request.setMaxCapacity(25);

                when(tripRepository.existsById(tripId)).thenReturn(true);

                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.of(activity));

                when(sessionIdService.getNextSessionId()).thenReturn(101);

                when(sessionPersistenceService.addSession(
                                eq(tripId), eq(activityId), any(ActivitySession.class)))
                                .thenReturn(true);

                ActivitySession result = activityService.createActivitySession(
                                tripId, activityId, request);

                assertEquals(101, result.getId());
                assertEquals(LocalDate.of(2027, 3, 9), result.getDate());
                assertEquals(LocalTime.of(10, 0), result.getTime());
                assertEquals(25, result.getMaxCapacity());
                assertEquals(0, result.getReservedCount());
                assertTrue(result.isActive());

                verify(sessionIdService).getNextSessionId();

                verify(sessionPersistenceService).addSession(
                                tripId, activityId, result);

                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void rejectsSessionCreationWhenActivityDoesNotExist() {
                String tripId = "trip123";
                String activityId = "missingActivity";

                CreateActivitySessionRequest request = new CreateActivitySessionRequest();

                request.setDate(LocalDate.of(2027, 3, 9));
                request.setTime(LocalTime.of(10, 0));
                request.setMaxCapacity(25);

                when(tripRepository.existsById(tripId)).thenReturn(true);
                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.empty());

                NoSuchElementException exception = assertThrows(
                                NoSuchElementException.class,
                                () -> activityService.createActivitySession(
                                                tripId, activityId, request));

                assertEquals(
                                "Activity not found: missingActivity",
                                exception.getMessage());

                verify(tripRepository).existsById(tripId);
                verify(activityRepository).findById(activityId);

                verify(sessionIdService, never()).getNextSessionId();
                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void rejectsSessionCreationWhenActivityBelongsToDifferentTrip() {
                String tripId = "trip123";
                String activityId = "activity456";

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId("anotherTrip");
                activity.setName("Catamaran & Snorkeling");

                CreateActivitySessionRequest request = new CreateActivitySessionRequest();

                request.setDate(LocalDate.of(2027, 3, 9));
                request.setTime(LocalTime.of(10, 0));
                request.setMaxCapacity(25);

                when(tripRepository.existsById(tripId)).thenReturn(true);
                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.of(activity));

                NoSuchElementException exception = assertThrows(
                                NoSuchElementException.class,
                                () -> activityService.createActivitySession(
                                                tripId, activityId, request));

                assertEquals(
                                "Activity not found for trip: trip123",
                                exception.getMessage());

                verify(tripRepository).existsById(tripId);
                verify(activityRepository).findById(activityId);

                verify(sessionIdService, never()).getNextSessionId();
                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void rejectsSessionCreationWhenTripDoesNotExist() {
                String tripId = "missingTrip";
                String activityId = "activity456";

                CreateActivitySessionRequest request = new CreateActivitySessionRequest();

                request.setDate(LocalDate.of(2027, 3, 9));
                request.setTime(LocalTime.of(10, 0));
                request.setMaxCapacity(25);

                when(tripRepository.existsById(tripId)).thenReturn(false);

                NoSuchElementException exception = assertThrows(
                                NoSuchElementException.class,
                                () -> activityService.createActivitySession(
                                                tripId, activityId, request));

                assertEquals(
                                "Trip not found: missingTrip",
                                exception.getMessage());

                verify(tripRepository).existsById(tripId);

                verify(activityRepository, never()).findById(anyString());
                verify(sessionIdService, never()).getNextSessionId();
                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void rejectsSessionCapacityBelowExistingRegistrations() {

                String tripId = "trip123";
                String activityId = "activity456";
                int sessionId = 1;

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                ActivitySession session = new ActivitySession();
                session.setId(sessionId);
                session.setMaxCapacity(20);

                activity.setSessions(List.of(session));

                ActivitySession updatedSession = new ActivitySession();
                updatedSession.setMaxCapacity(5);

                Registration registration = new Registration();

                ActivitySelection selection = new ActivitySelection();

                selection.setActivityId(activityId);

                selection.setSessionId(sessionId);
                registration.setActivities(List.of(selection));

                List<Registration> registrations = new ArrayList<>();

                for (int i = 0; i < 10; i++) {
                        Registration registeredTraveler = new Registration();
                        registeredTraveler.setActivities(List.of(selection));
                        registrations.add(registeredTraveler);
                }

                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.of(activity));

                when(registrationRepository.findByTripId(tripId))
                                .thenReturn(registrations);

                assertThrows(IllegalArgumentException.class, () -> activityService.updateActivitySession(
                                tripId,
                                activityId,
                                sessionId,
                                updatedSession));

                verify(activityRepository, never()).save(any(Activity.class));
                verifyNoInteractions(sessionPersistenceService);

        }

        @Test
        void rejectsSessionCapacityBelowTravelerAndGuestCount() {
                String tripId = "trip123";
                String activityId = "activity456";
                int sessionId = 1;

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                ActivitySession session = new ActivitySession();
                session.setId(sessionId);
                session.setMaxCapacity(20);
                activity.setSessions(List.of(session));

                ActivitySession updatedSession = new ActivitySession();
                updatedSession.setMaxCapacity(6);

                ActivitySelection selection = new ActivitySelection();
                selection.setActivityId(activityId);
                selection.setSessionId(sessionId);

                List<Registration> registrations = new ArrayList<>();

                for (int i = 0; i < 4; i++) {
                        Registration registration = new Registration();
                        registration.setActivities(List.of(selection));

                        Guest guest = new Guest();
                        guest.setActivities(List.of(selection));
                        registration.setGuest(guest);

                        registrations.add(registration);
                }

                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.of(activity));

                when(registrationRepository.findByTripId(tripId))
                                .thenReturn(registrations);

                assertThrows(IllegalArgumentException.class, () -> activityService.updateActivitySession(
                                tripId,
                                activityId,
                                sessionId,
                                updatedSession));

                verify(activityRepository, never()).save(any(Activity.class));
                verifyNoInteractions(sessionPersistenceService);
        }

        @Test
        void allowsSessionCapacityEqualToRegisteredCount() {
                String tripId = "trip123";
                String activityId = "activity456";
                int sessionId = 1;

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                ActivitySession session = new ActivitySession();
                session.setId(sessionId);
                session.setMaxCapacity(20);
                session.setReservedCount(8);
                activity.setSessions(List.of(session));

                ActivitySession updatedSession = new ActivitySession();
                updatedSession.setMaxCapacity(8);

                ActivitySelection selection = new ActivitySelection();
                selection.setActivityId(activityId);
                selection.setSessionId(sessionId);

                List<Registration> registrations = new ArrayList<>();

                for (int i = 0; i < 4; i++) {
                        Registration registration = new Registration();
                        registration.setActivities(List.of(selection));

                        Guest guest = new Guest();
                        guest.setActivities(List.of(selection));
                        registration.setGuest(guest);

                        registrations.add(registration);
                }

                ActivitySession persistedSession = new ActivitySession();
                persistedSession.setId(sessionId);
                persistedSession.setMaxCapacity(8);
                persistedSession.setReservedCount(8);

                Activity persistedActivity = new Activity();
                persistedActivity.setId(activityId);
                persistedActivity.setTripId(tripId);
                persistedActivity.setSessions(List.of(persistedSession));

                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.of(activity));

                when(registrationRepository.findByTripId(tripId))
                                .thenReturn(registrations);

                when(sessionPersistenceService.updateSession(
                                tripId, activityId, sessionId, updatedSession))
                                .thenReturn(Optional.of(persistedActivity));

                Activity result = activityService.updateActivitySession(
                                tripId, activityId, sessionId, updatedSession);

                assertEquals(8, result.getSessions().getFirst().getMaxCapacity());
                assertEquals(8, result.getSessions().getFirst().getReservedCount());

                verify(sessionPersistenceService).updateSession(
                                tripId, activityId, sessionId, updatedSession);

                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void deletesSessionWhenNoTravelersAreRegistered() {
                String tripId = "trip123";
                String activityId = "activity456";

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                ActivitySession firstSession = new ActivitySession();
                firstSession.setId(101);

                ActivitySession secondSession = new ActivitySession();
                secondSession.setId(102);
                secondSession.setReservedCount(7);

                activity.setSessions(
                                new ArrayList<>(List.of(firstSession, secondSession)));

                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.of(activity));

                when(registrationRepository.findByTripId(tripId))
                                .thenReturn(List.of());

                when(sessionPersistenceService.deleteSession(
                                tripId, activityId, 101))
                                .thenReturn(true);

                activityService.deleteActivitySession(
                                tripId, activityId, 101);

                verify(sessionPersistenceService).deleteSession(
                                tripId, activityId, 101);

                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void rejectsDeletionWhenTravelerIsRegistered() {
                String tripId = "trip123";
                String activityId = "activity456";

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                ActivitySession session = new ActivitySession();
                session.setId(101);

                activity.setSessions(new ArrayList<>(List.of(session)));

                ActivitySelection selection = new ActivitySelection();
                selection.setActivityId(activityId);
                selection.setSessionId(101);

                Registration registration = new Registration();
                registration.setActivities(List.of(selection));

                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.of(activity));

                when(registrationRepository.findByTripId(tripId))
                                .thenReturn(List.of(registration));

                assertThrows(
                                IllegalStateException.class,
                                () -> activityService.deleteActivitySession(
                                                tripId, activityId, 101));

                assertEquals(1, activity.getSessions().size());
                verify(activityRepository, never()).save(any(Activity.class));
                verifyNoInteractions(sessionPersistenceService);

        }

        @Test
        void rejectsDeletionWhenGuestIsRegistered() {
                String tripId = "trip123";
                String activityId = "activity456";

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                ActivitySession session = new ActivitySession();
                session.setId(101);

                activity.setSessions(new ArrayList<>(List.of(session)));

                ActivitySelection selection = new ActivitySelection();
                selection.setActivityId(activityId);
                selection.setSessionId(101);

                Guest guest = new Guest();
                guest.setActivities(List.of(selection));

                Registration registration = new Registration();
                registration.setGuest(guest);

                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.of(activity));

                when(registrationRepository.findByTripId(tripId))
                                .thenReturn(List.of(registration));

                assertThrows(
                                IllegalStateException.class,
                                () -> activityService.deleteActivitySession(
                                                tripId, activityId, 101));

                assertEquals(1, activity.getSessions().size());
                verify(activityRepository, never()).save(any(Activity.class));
                verifyNoInteractions(sessionPersistenceService);
        }

        @Test
        void rejectsSessionCapacityBelowOne() {
                String tripId = "trip123";
                String activityId = "activity456";

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                ActivitySession session = new ActivitySession();
                session.setId(101);
                session.setMaxCapacity(20);
                activity.setSessions(List.of(session));

                ActivitySession updatedSession = new ActivitySession();
                updatedSession.setMaxCapacity(0);

                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.of(activity));

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> activityService.updateActivitySession(
                                                tripId, activityId, 101, updatedSession));

                assertEquals(
                                "Session capacity must be at least 1.",
                                exception.getMessage());

                verifyNoInteractions(sessionPersistenceService);
                verifyNoInteractions(registrationRepository);
                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void rejectsCapacityReductionWhenAtomicConditionFails() {
                String tripId = "trip123";
                String activityId = "activity456";

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                ActivitySession session = new ActivitySession();
                session.setId(101);
                session.setMaxCapacity(20);
                session.setReservedCount(5);
                activity.setSessions(List.of(session));

                Activity currentActivity = new Activity();
                currentActivity.setId(activityId);
                currentActivity.setTripId(tripId);

                ActivitySession currentSession = new ActivitySession();
                currentSession.setId(101);
                currentSession.setMaxCapacity(20);
                currentSession.setReservedCount(6);
                currentActivity.setSessions(List.of(currentSession));

                ActivitySession updatedSession = new ActivitySession();
                updatedSession.setMaxCapacity(5);

                when(activityRepository.findById(activityId))
                                .thenReturn(
                                                Optional.of(activity),
                                                Optional.of(currentActivity));

                when(registrationRepository.findByTripId(tripId))
                                .thenReturn(List.of());

                when(sessionPersistenceService.updateSession(
                                tripId, activityId, 101, updatedSession))
                                .thenReturn(Optional.empty());

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> activityService.updateActivitySession(
                                                tripId, activityId, 101, updatedSession));

                assertEquals(
                                "Session capacity cannot be less than the number of reserved seats.",
                                exception.getMessage());

                verify(sessionPersistenceService).updateSession(
                                tripId, activityId, 101, updatedSession);

                verify(activityRepository, times(2)).findById(activityId);
                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void rejectsDeletionWhenAtomicConditionFails() {
                String tripId = "trip123";
                String activityId = "activity456";

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                ActivitySession session = new ActivitySession();
                session.setId(101);
                session.setReservedCount(0);
                activity.setSessions(List.of(session));

                Activity currentActivity = new Activity();
                currentActivity.setId(activityId);
                currentActivity.setTripId(tripId);

                ActivitySession currentSession = new ActivitySession();
                currentSession.setId(101);
                currentSession.setReservedCount(1);
                currentActivity.setSessions(List.of(currentSession));

                when(activityRepository.findById(activityId))
                                .thenReturn(
                                                Optional.of(activity),
                                                Optional.of(currentActivity));

                when(registrationRepository.findByTripId(tripId))
                                .thenReturn(List.of());

                when(sessionPersistenceService.deleteSession(
                                tripId, activityId, 101))
                                .thenReturn(false);

                IllegalStateException exception = assertThrows(
                                IllegalStateException.class,
                                () -> activityService.deleteActivitySession(
                                                tripId, activityId, 101));

                assertEquals(
                                "Cannot delete a session with reserved seats.",
                                exception.getMessage());

                verify(sessionPersistenceService).deleteSession(
                                tripId, activityId, 101);

                verify(activityRepository, times(2)).findById(activityId);
                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void rejectsUpdateWhenSessionWasConcurrentlyDeleted() {
                String tripId = "trip123";
                String activityId = "activity456";

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                ActivitySession session = new ActivitySession();
                session.setId(101);
                session.setMaxCapacity(20);
                activity.setSessions(List.of(session));

                Activity currentActivity = new Activity();
                currentActivity.setId(activityId);
                currentActivity.setTripId(tripId);
                currentActivity.setSessions(List.of());

                ActivitySession updatedSession = new ActivitySession();
                updatedSession.setMaxCapacity(30);

                when(activityRepository.findById(activityId))
                                .thenReturn(
                                                Optional.of(activity),
                                                Optional.of(currentActivity));

                when(registrationRepository.findByTripId(tripId))
                                .thenReturn(List.of());

                when(sessionPersistenceService.updateSession(
                                tripId, activityId, 101, updatedSession))
                                .thenReturn(Optional.empty());

                NoSuchElementException exception = assertThrows(
                                NoSuchElementException.class,
                                () -> activityService.updateActivitySession(
                                                tripId, activityId, 101, updatedSession));

                assertEquals(
                                "Activity session not found: 101",
                                exception.getMessage());

                verify(sessionPersistenceService).updateSession(
                                tripId, activityId, 101, updatedSession);

                verify(activityRepository, never()).save(any(Activity.class));
        }

        @Test
        void rejectsSessionCreationWhenActivityDisappearsBeforePersistence() {
                String tripId = "trip123";
                String activityId = "activity456";

                Activity activity = new Activity();
                activity.setId(activityId);
                activity.setTripId(tripId);

                CreateActivitySessionRequest request = new CreateActivitySessionRequest();

                request.setDate(LocalDate.of(2027, 3, 9));
                request.setTime(LocalTime.of(10, 0));
                request.setMaxCapacity(25);

                when(tripRepository.existsById(tripId))
                                .thenReturn(true);

                when(activityRepository.findById(activityId))
                                .thenReturn(Optional.of(activity));

                when(sessionIdService.getNextSessionId())
                                .thenReturn(101);

                when(sessionPersistenceService.addSession(
                                eq(tripId), eq(activityId), any(ActivitySession.class)))
                                .thenReturn(false);

                NoSuchElementException exception = assertThrows(
                                NoSuchElementException.class,
                                () -> activityService.createActivitySession(
                                                tripId, activityId, request));

                assertEquals(
                                "Activity not found: activity456",
                                exception.getMessage());

                verify(sessionPersistenceService).addSession(
                                eq(tripId), eq(activityId), any(ActivitySession.class));

                verify(activityRepository, never()).save(any(Activity.class));
        }

}