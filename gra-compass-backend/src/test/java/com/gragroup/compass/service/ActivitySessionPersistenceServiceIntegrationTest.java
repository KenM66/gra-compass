package com.gragroup.compass.service;

import com.gragroup.compass.model.Activity;
import com.gragroup.compass.model.ActivitySession;
import com.gragroup.compass.repository.ActivityRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ActivitySessionPersistenceServiceIntegrationTest {

    @Autowired
    private ActivitySessionPersistenceService persistenceService;

    @Autowired
    private ActivityReservationService reservationService;

    @Autowired
    private ActivityRepository activityRepository;

    private String tripId;
    private String activityId;

    @BeforeEach
    void setUp() {
        tripId = "session-persistence-test-" + UUID.randomUUID();

        Activity activity = new Activity();
        activity.setTripId(tripId);
        activity.setType("Excursion");
        activity.setName("Session Persistence Test");

        activity.setSessions(new ArrayList<>(List.of(
                createSession(101, 10, 3),
                createSession(102, 20, 7),
                createSession(103, 15, 0))));

        activityId = activityRepository.save(activity).getId();
    }

    @AfterEach
    void tearDown() {
        if (activityId != null) {
            activityRepository.deleteById(activityId);
        }
    }

    private ActivitySession createSession(
            int sessionId,
            int maxCapacity,
            int reservedCount) {

        ActivitySession session = new ActivitySession();
        session.setId(sessionId);
        session.setDate(LocalDate.of(2027, 3, 9));
        session.setTime(LocalTime.of(10, 0));
        session.setMaxCapacity(maxCapacity);
        session.setReservedCount(reservedCount);
        session.setActive(true);

        return session;
    }

    private Activity reloadActivity() {
        return activityRepository.findById(activityId)
                .orElseThrow();
    }

    private ActivitySession findSession(
            Activity activity,
            int sessionId) {

        return activity.getSessions().stream()
                .filter(session -> session.getId() == sessionId)
                .findFirst()
                .orElseThrow();
    }

    @Test
    void updatesSessionWithoutOverwritingReservationCounts() {
        ActivitySession updatedSession = createSession(101, 25, 0);

        updatedSession.setDate(LocalDate.of(2027, 3, 10));
        updatedSession.setTime(LocalTime.of(14, 30));
        updatedSession.setActive(false);

        Optional<Activity> result = persistenceService.updateSession(
                tripId, activityId, 101, updatedSession);

        assertTrue(result.isPresent());

        Activity persistedActivity = reloadActivity();

        ActivitySession firstSession = findSession(persistedActivity, 101);

        assertEquals(25, firstSession.getMaxCapacity());
        assertEquals(3, firstSession.getReservedCount());
        assertEquals(
                LocalDate.of(2027, 3, 10),
                firstSession.getDate());
        assertEquals(
                LocalTime.of(14, 30),
                firstSession.getTime());
        assertFalse(firstSession.isActive());

        ActivitySession secondSession = findSession(persistedActivity, 102);

        assertEquals(20, secondSession.getMaxCapacity());
        assertEquals(7, secondSession.getReservedCount());
        assertTrue(secondSession.isActive());

        assertEquals(3, persistedActivity.getSessions().size());
    }

    @Test
    void rejectsCapacityBelowCurrentReservedCount() {
        ActivitySession updatedSession = createSession(101, 2, 0);

        Optional<Activity> result = persistenceService.updateSession(
                tripId, activityId, 101, updatedSession);

        assertTrue(result.isEmpty());

        ActivitySession persistedSession = findSession(reloadActivity(), 101);

        assertEquals(10, persistedSession.getMaxCapacity());
        assertEquals(3, persistedSession.getReservedCount());
    }

    @Test
    void allowsCapacityEqualToCurrentReservedCount() {
        ActivitySession updatedSession = createSession(101, 3, 0);

        Optional<Activity> result = persistenceService.updateSession(
                tripId, activityId, 101, updatedSession);

        assertTrue(result.isPresent());

        ActivitySession persistedSession = findSession(reloadActivity(), 101);

        assertEquals(3, persistedSession.getMaxCapacity());
        assertEquals(3, persistedSession.getReservedCount());

        assertFalse(reservationService.reserveSeat(
                tripId, activityId, 101));
    }

    @Test
    void rejectsCapacityReductionAfterAdditionalReservation() {
        ActivitySession updatedSession = createSession(101, 3, 0);

        assertTrue(reservationService.reserveSeat(
                tripId, activityId, 101));

        Optional<Activity> result = persistenceService.updateSession(
                tripId, activityId, 101, updatedSession);

        assertTrue(result.isEmpty());

        ActivitySession persistedSession = findSession(reloadActivity(), 101);

        assertEquals(10, persistedSession.getMaxCapacity());
        assertEquals(4, persistedSession.getReservedCount());
    }

    @Test
    void rejectsDeletionOfOccupiedSession() {
        assertFalse(persistenceService.deleteSession(
                tripId, activityId, 101));

        Activity activity = reloadActivity();

        assertEquals(3, activity.getSessions().size());
        assertEquals(
                3,
                findSession(activity, 101).getReservedCount());
    }

    @Test
    void deletesEmptySessionWithoutChangingOtherSessions() {
        assertTrue(persistenceService.deleteSession(
                tripId, activityId, 103));

        Activity activity = reloadActivity();

        assertEquals(2, activity.getSessions().size());

        assertFalse(activity.getSessions().stream()
                .anyMatch(session -> session.getId() == 103));

        assertEquals(
                3,
                findSession(activity, 101).getReservedCount());

        assertEquals(
                7,
                findSession(activity, 102).getReservedCount());
    }

    @Test
    void rejectsDeletionAfterNewReservation() {
        assertEquals(
                0,
                findSession(reloadActivity(), 103)
                        .getReservedCount());

        assertTrue(reservationService.reserveSeat(
                tripId, activityId, 103));

        assertFalse(persistenceService.deleteSession(
                tripId, activityId, 103));

        Activity activity = reloadActivity();

        assertEquals(3, activity.getSessions().size());

        assertEquals(
                1,
                findSession(activity, 103).getReservedCount());
    }

    @Test
    void addsSessionWithoutOverwritingExistingReservations() {
        ActivitySession newSession = createSession(104, 30, 0);

        assertTrue(reservationService.reserveSeat(
                tripId, activityId, 101));

        assertTrue(persistenceService.addSession(
                tripId, activityId, newSession));

        Activity activity = reloadActivity();

        assertEquals(4, activity.getSessions().size());

        assertEquals(
                4,
                findSession(activity, 101).getReservedCount());

        assertEquals(
                7,
                findSession(activity, 102).getReservedCount());

        ActivitySession persistedSession = findSession(activity, 104);

        assertEquals(30, persistedSession.getMaxCapacity());
        assertEquals(0, persistedSession.getReservedCount());
        assertEquals(newSession.getDate(), persistedSession.getDate());
        assertEquals(newSession.getTime(), persistedSession.getTime());
        assertTrue(persistedSession.isActive());
    }

    @Test
    void rejectsOperationsForIncorrectTrip() {
        String incorrectTripId = "incorrect-trip";

        ActivitySession updatedSession = createSession(101, 30, 0);

        ActivitySession newSession = createSession(104, 30, 0);

        assertTrue(persistenceService.updateSession(
                incorrectTripId,
                activityId,
                101,
                updatedSession).isEmpty());

        assertFalse(persistenceService.deleteSession(
                incorrectTripId, activityId, 103));

        assertFalse(persistenceService.addSession(
                incorrectTripId, activityId, newSession));

        Activity activity = reloadActivity();

        assertEquals(3, activity.getSessions().size());

        assertEquals(
                10,
                findSession(activity, 101).getMaxCapacity());

        assertEquals(
                3,
                findSession(activity, 101).getReservedCount());
    }

    @Test
    void rejectsOperationsForMissingSession() {
        ActivitySession updatedSession = createSession(999, 30, 0);

        assertTrue(persistenceService.updateSession(
                tripId,
                activityId,
                999,
                updatedSession).isEmpty());

        assertFalse(persistenceService.deleteSession(
                tripId, activityId, 999));

        assertEquals(3, reloadActivity().getSessions().size());
    }
}