package com.gragroup.compass.service;

import com.gragroup.compass.dto.CreateActivityRequest;
import com.gragroup.compass.model.Activity;
import com.gragroup.compass.repository.ActivityRepository;
import com.gragroup.compass.repository.TripRepository;
import com.gragroup.compass.repository.RegistrationRepository;
import com.gragroup.compass.dto.CreateActivitySessionRequest;
import com.gragroup.compass.model.ActivitySession;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.NoSuchElementException;
import java.util.List;

class ActivityServiceTest {

        private ActivityRepository activityRepository;
        private TripRepository tripRepository;
        private SessionIdService sessionIdService;
        private ActivityService activityService;
        private RegistrationRepository registrationRepository;

        @BeforeEach
        void setUp() {
                activityRepository = Mockito.mock(ActivityRepository.class);
                tripRepository = Mockito.mock(TripRepository.class);
                registrationRepository = Mockito.mock(RegistrationRepository.class);
                sessionIdService = Mockito.mock(SessionIdService.class);

                activityService = new ActivityService(
                                activityRepository,
                                tripRepository,
                                registrationRepository,
                                sessionIdService);
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
                when(activityRepository.save(activity)).thenReturn(activity);

                ActivitySession result = activityService.createActivitySession(
                                tripId, activityId, request);

                assertEquals(101, result.getId());
                assertEquals(LocalDate.of(2027, 3, 9), result.getDate());
                assertEquals(LocalTime.of(10, 0), result.getTime());
                assertEquals(25, result.getMaxCapacity());
                assertTrue(result.isActive());

                assertEquals(1, activity.getSessions().size());
                assertSame(result, activity.getSessions().getFirst());

                verify(sessionIdService).getNextSessionId();
                verify(activityRepository).save(activity);
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
}