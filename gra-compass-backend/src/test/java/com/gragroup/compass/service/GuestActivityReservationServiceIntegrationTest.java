package com.gragroup.compass.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import java.util.UUID;

import org.bson.Document;
import org.bson.types.ObjectId;
import com.mongodb.client.model.UpdateOptions;
import com.mongodb.client.result.UpdateResult;

import java.util.List;

import com.gragroup.compass.model.Registration;
import com.gragroup.compass.model.ActivitySelection;
import com.gragroup.compass.model.Guest;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@SpringBootTest
class GuestActivityReservationServiceIntegrationTest {

        @Autowired
        private GuestActivityReservationService guestReservationService;

        @Autowired
        private GuestActivityReservationRetryService retryService;

        @Autowired
        private TravelerActivityReservationService travelerReservationService;

        @Autowired
        private MongoTemplate mongoTemplate;
        private static final String TEST_TRIP_ID = "reservation-test-trip";

        private static final String TEST_ACTIVITY_ID = "6afe4f6965509de638bc199e";

        private static final int TEST_SESSION_ID = 999;

        private static final int REPLACEMENT_SESSION_ID = 1000;

        private static final int ADDITIONAL_SESSION_ID = 1001;

        private final String testRegistrationId = UUID.randomUUID().toString();

        private String savedRegistrationId;

        private final int testTravelerNumber = 1_000_000 + java.util.concurrent.ThreadLocalRandom
                        .current().nextInt(1_000_000);

        private Registration createTestRegistration() {

                Registration registration = new Registration();

                registration.setId(testRegistrationId);
                registration.setTripId(TEST_TRIP_ID);
                registration.setTravelerNumber(testTravelerNumber);
                registration.setFirstName("Test");
                registration.setLastName("Traveler");
                registration.setBringingGuest(true);

                Guest guest = new Guest();
                guest.setFirstName("Test");
                guest.setLastName("Guest");

                registration.setGuest(guest);

                return registration;
        }

        @BeforeEach
        void setUp() {
                Registration savedRegistration = mongoTemplate.save(createTestRegistration());

                assertEquals(testRegistrationId, savedRegistration.getId());
                savedRegistrationId = savedRegistration.getId();
        }

        @AfterEach
        void tearDown() {
                mongoTemplate.remove(
                                new org.springframework.data.mongodb.core.query.Query(
                                                org.springframework.data.mongodb.core.query.Criteria
                                                                .where("_id").is(savedRegistrationId)),
                                Registration.class);

                mongoTemplate.getCollection("activities").updateOne(
                                new Document("_id", new ObjectId(TEST_ACTIVITY_ID)),
                                new Document("$set",
                                                new Document("sessions.$[session].reservedCount", 0)),
                                new UpdateOptions().arrayFilters(
                                                List.of(new Document("session._id", TEST_SESSION_ID))));
                removeTestSession(REPLACEMENT_SESSION_ID);
                removeTestSession(ADDITIONAL_SESSION_ID);
        }

        @Test
        void shouldStartWithNoReservedSeats() {

                Document activity = mongoTemplate.getCollection("activities")
                                .find(new Document("_id", new ObjectId(TEST_ACTIVITY_ID)))
                                .first();

                assertNotNull(activity, "Test activity must exist");

                Document session = activity.getList("sessions", Document.class)
                                .stream()
                                .filter(item -> TEST_SESSION_ID == item.getInteger("_id"))
                                .findFirst()
                                .orElseThrow();

                assertEquals(0, session.getInteger("reservedCount"));
        }

        @Test
        void shouldSaveGuestActivityReservation() {

                Registration updatedRegistration = guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertNotNull(updatedRegistration.getGuest());
                assertNotNull(updatedRegistration.getGuest().getActivities());

                assertEquals(
                                1,
                                updatedRegistration.getGuest().getActivities().size());

                ActivitySelection selection = updatedRegistration.getGuest().getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                assertEquals(TEST_SESSION_ID, selection.getSessionId());

                Document activity = mongoTemplate.getCollection("activities")
                                .find(new Document("_id", new ObjectId(TEST_ACTIVITY_ID)))
                                .first();

                assertNotNull(activity);

                Document session = activity.getList("sessions", Document.class)
                                .stream()
                                .filter(item -> TEST_SESSION_ID == item.getInteger("_id"))
                                .findFirst()
                                .orElseThrow();

                assertEquals(1, session.getInteger("reservedCount"));
        }

        @Test
        void shouldNotReserveDuplicateGuestActivity() {

                Registration first = guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                Registration second = guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertNotNull(first);
                assertNotNull(second);

                assertEquals(1, second.getGuest().getActivities().size());

                Document activity = mongoTemplate.getCollection("activities")
                                .find(new Document("_id", new ObjectId(TEST_ACTIVITY_ID)))
                                .first();

                assertNotNull(activity);

                Document session = activity.getList("sessions", Document.class)
                                .stream()
                                .filter(item -> TEST_SESSION_ID == item.getInteger("_id"))
                                .findFirst()
                                .orElseThrow();

                assertEquals(1, session.getInteger("reservedCount"));
        }

        @Test
        void shouldNotDoubleBookGuestUnderConcurrentRequests() throws Exception {

                ExecutorService executor = Executors.newFixedThreadPool(2);
                CountDownLatch start = new CountDownLatch(1);

                try {
                        Future<?> first = executor.submit(() -> {
                                start.await();
                                try {
                                        retryService.reserveGuestActivity(
                                                        TEST_TRIP_ID, testTravelerNumber,
                                                        TEST_ACTIVITY_ID, TEST_SESSION_ID);
                                } catch (Exception exception) {
                                        throw new AssertionError(
                                                        "Concurrent reservation should have succeeded after retry",
                                                        exception);
                                }
                                return null;
                        });

                        Future<?> second = executor.submit(() -> {
                                start.await();
                                try {
                                        retryService.reserveGuestActivity(
                                                        TEST_TRIP_ID, testTravelerNumber,
                                                        TEST_ACTIVITY_ID, TEST_SESSION_ID);
                                } catch (Exception exception) {
                                        throw new AssertionError(
                                                        "Concurrent reservation should have succeeded after retry",
                                                        exception);
                                }
                                return null;
                        });

                        start.countDown();

                        first.get(10, TimeUnit.SECONDS);
                        second.get(10, TimeUnit.SECONDS);

                        Registration registration = mongoTemplate.findById(
                                        savedRegistrationId, Registration.class);

                        assertNotNull(registration);
                        assertNotNull(registration.getGuest());
                        assertNotNull(registration.getGuest().getActivities());

                        assertEquals(1, registration.getGuest().getActivities().size());

                        Document activity = mongoTemplate.getCollection("activities")
                                        .find(new Document("_id", new ObjectId(TEST_ACTIVITY_ID)))
                                        .first();

                        assertNotNull(activity);

                        Document session = activity.getList("sessions", Document.class)
                                        .stream()
                                        .filter(item -> TEST_SESSION_ID == item.getInteger("_id"))
                                        .findFirst()
                                        .orElseThrow();

                        assertEquals(1, session.getInteger("reservedCount"));

                } finally {
                        executor.shutdownNow();
                }
        }

        @Test
        void shouldCancelGuestActivityAndReleaseSeat() {

                guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                Registration updatedRegistration = guestReservationService.cancelGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertNotNull(updatedRegistration.getGuest());
                assertTrue(
                                updatedRegistration.getGuest().getActivities() == null
                                                || updatedRegistration.getGuest().getActivities().isEmpty());

                Document activity = mongoTemplate.getCollection("activities")
                                .find(new Document("_id", new ObjectId(TEST_ACTIVITY_ID)))
                                .first();

                assertNotNull(activity);

                Document session = activity.getList("sessions", Document.class)
                                .stream()
                                .filter(item -> TEST_SESSION_ID == item.getInteger("_id"))
                                .findFirst()
                                .orElseThrow();

                assertEquals(0, session.getInteger("reservedCount"));
        }

        @Test
        void shouldPreserveGuestReservationWhenTravelerCancels() {

                Document activityFilter = new Document(
                                "_id", new ObjectId(TEST_ACTIVITY_ID));

                Document sessionFilter = new Document(
                                "session._id", TEST_SESSION_ID);

                Document originalActivity = mongoTemplate
                                .getCollection("activities")
                                .find(activityFilter)
                                .first();

                assertNotNull(originalActivity);

                Document originalSession = originalActivity
                                .getList("sessions", Document.class)
                                .stream()
                                .filter(item -> TEST_SESSION_ID == item.getInteger("_id"))
                                .findFirst()
                                .orElseThrow();

                int originalCapacity = originalSession.getInteger("maxCapacity");

                try {
                        mongoTemplate.getCollection("activities").updateOne(
                                        activityFilter,
                                        new Document("$set",
                                                        new Document("sessions.$[session].maxCapacity", 2)),
                                        new UpdateOptions().arrayFilters(
                                                        List.of(sessionFilter)));

                        travelerReservationService.reserveTravelerActivity(
                                        TEST_TRIP_ID,
                                        testTravelerNumber,
                                        TEST_ACTIVITY_ID,
                                        TEST_SESSION_ID);

                        guestReservationService.reserveGuestActivity(
                                        TEST_TRIP_ID,
                                        testTravelerNumber,
                                        TEST_ACTIVITY_ID,
                                        TEST_SESSION_ID);

                        Document activityBefore = mongoTemplate
                                        .getCollection("activities")
                                        .find(activityFilter)
                                        .first();

                        assertNotNull(activityBefore);

                        Document sessionBefore = activityBefore
                                        .getList("sessions", Document.class)
                                        .stream()
                                        .filter(item -> TEST_SESSION_ID == item.getInteger("_id"))
                                        .findFirst()
                                        .orElseThrow();

                        assertEquals(2, sessionBefore.getInteger("reservedCount"));

                        travelerReservationService.cancelTravelerActivity(
                                        TEST_TRIP_ID,
                                        testTravelerNumber,
                                        TEST_ACTIVITY_ID,
                                        TEST_SESSION_ID);

                        Registration persistedRegistration = mongoTemplate.findById(
                                        savedRegistrationId,
                                        Registration.class);

                        assertNotNull(persistedRegistration);

                        assertNotNull(persistedRegistration.getActivities());
                        assertTrue(persistedRegistration.getActivities().isEmpty());

                        assertTrue(persistedRegistration.isBringingGuest());
                        assertNotNull(persistedRegistration.getGuest());
                        assertNotNull(persistedRegistration.getGuest().getActivities());

                        assertEquals(
                                        1,
                                        persistedRegistration.getGuest().getActivities().size());

                        ActivitySelection guestSelection = persistedRegistration
                                        .getGuest().getActivities().get(0);

                        assertEquals(TEST_ACTIVITY_ID, guestSelection.getActivityId());
                        assertEquals(TEST_SESSION_ID, guestSelection.getSessionId());

                        Document activityAfter = mongoTemplate
                                        .getCollection("activities")
                                        .find(activityFilter)
                                        .first();

                        assertNotNull(activityAfter);

                        Document sessionAfter = activityAfter
                                        .getList("sessions", Document.class)
                                        .stream()
                                        .filter(item -> TEST_SESSION_ID == item.getInteger("_id"))
                                        .findFirst()
                                        .orElseThrow();

                        assertEquals(1, sessionAfter.getInteger("reservedCount"));

                } finally {
                        mongoTemplate.getCollection("activities").updateOne(
                                        activityFilter,
                                        new Document("$set",
                                                        new Document(
                                                                        "sessions.$[session].maxCapacity",
                                                                        originalCapacity)),
                                        new UpdateOptions().arrayFilters(
                                                        List.of(sessionFilter)));
                }
        }

        @Test
        void shouldPreserveGuestReservationWhenTravelerSwitchesSession() {

                int replacementSessionId = 1000;

                Document activityFilter = new Document(
                                "_id", new ObjectId(TEST_ACTIVITY_ID));

                Document sessionFilter = new Document(
                                "session._id", TEST_SESSION_ID);

                Document originalActivity = mongoTemplate
                                .getCollection("activities")
                                .find(activityFilter)
                                .first();

                assertNotNull(originalActivity);

                Document originalSession = originalActivity
                                .getList("sessions", Document.class)
                                .stream()
                                .filter(item -> TEST_SESSION_ID == item.getInteger("_id"))
                                .findFirst()
                                .orElseThrow();

                int originalCapacity = originalSession.getInteger("maxCapacity");

                assertFalse(originalActivity.getList("sessions", Document.class)
                                .stream()
                                .anyMatch(item -> replacementSessionId == item.getInteger("_id")));

                try {
                        mongoTemplate.getCollection("activities").updateOne(
                                        activityFilter,
                                        new Document("$set",
                                                        new Document("sessions.$[session].maxCapacity", 2)),
                                        new UpdateOptions().arrayFilters(
                                                        List.of(sessionFilter)));

                        Document replacementSession = new Document(
                                        "_id", replacementSessionId)
                                        .append("maxCapacity", 1)
                                        .append("reservedCount", 0)
                                        .append("active", true);

                        mongoTemplate.getCollection("activities").updateOne(
                                        activityFilter,
                                        new Document("$push",
                                                        new Document("sessions", replacementSession)));

                        travelerReservationService.reserveTravelerActivity(
                                        TEST_TRIP_ID,
                                        testTravelerNumber,
                                        TEST_ACTIVITY_ID,
                                        TEST_SESSION_ID);

                        guestReservationService.reserveGuestActivity(
                                        TEST_TRIP_ID,
                                        testTravelerNumber,
                                        TEST_ACTIVITY_ID,
                                        TEST_SESSION_ID);

                        travelerReservationService.switchTravelerActivitySession(
                                        TEST_TRIP_ID,
                                        testTravelerNumber,
                                        TEST_ACTIVITY_ID,
                                        TEST_SESSION_ID,
                                        replacementSessionId);

                        Registration persistedRegistration = mongoTemplate.findById(
                                        savedRegistrationId,
                                        Registration.class);

                        assertNotNull(persistedRegistration);
                        assertNotNull(persistedRegistration.getActivities());
                        assertEquals(1, persistedRegistration.getActivities().size());

                        ActivitySelection travelerSelection = persistedRegistration.getActivities().get(0);

                        assertEquals(TEST_ACTIVITY_ID, travelerSelection.getActivityId());
                        assertEquals(replacementSessionId, travelerSelection.getSessionId());

                        assertTrue(persistedRegistration.isBringingGuest());
                        assertNotNull(persistedRegistration.getGuest());
                        assertNotNull(persistedRegistration.getGuest().getActivities());

                        assertEquals(1,
                                        persistedRegistration.getGuest().getActivities().size());

                        ActivitySelection guestSelection = persistedRegistration.getGuest().getActivities().get(0);

                        assertEquals(TEST_ACTIVITY_ID, guestSelection.getActivityId());
                        assertEquals(TEST_SESSION_ID, guestSelection.getSessionId());

                        Document activityAfter = mongoTemplate
                                        .getCollection("activities")
                                        .find(activityFilter)
                                        .first();

                        assertNotNull(activityAfter);

                        Document originalSessionAfter = activityAfter
                                        .getList("sessions", Document.class)
                                        .stream()
                                        .filter(item -> TEST_SESSION_ID == item.getInteger("_id"))
                                        .findFirst()
                                        .orElseThrow();

                        Document replacementSessionAfter = activityAfter
                                        .getList("sessions", Document.class)
                                        .stream()
                                        .filter(item -> replacementSessionId == item.getInteger("_id"))
                                        .findFirst()
                                        .orElseThrow();

                        assertEquals(1, originalSessionAfter.getInteger("reservedCount"));
                        assertEquals(1, replacementSessionAfter.getInteger("reservedCount"));

                } finally {
                        mongoTemplate.getCollection("activities").updateOne(
                                        activityFilter,
                                        new Document("$set",
                                                        new Document("sessions.$[session].maxCapacity",
                                                                        originalCapacity)),
                                        new UpdateOptions().arrayFilters(
                                                        List.of(sessionFilter)));

                        mongoTemplate.getCollection("activities").updateOne(
                                        activityFilter,
                                        new Document("$pull",
                                                        new Document("sessions",
                                                                        new Document("_id", replacementSessionId))));
                }
        }

        private void createTestSession(
                        int sessionId,
                        int maxCapacity,
                        int reservedCount,
                        boolean active) {

                Document session = new Document("_id", sessionId)
                                .append("maxCapacity", maxCapacity)
                                .append("reservedCount", reservedCount)
                                .append("active", active);

                UpdateResult result = mongoTemplate.getCollection("activities")
                                .updateOne(
                                                new Document("_id", new ObjectId(TEST_ACTIVITY_ID))
                                                                .append("sessions._id",
                                                                                new Document("$ne", sessionId)),
                                                new Document("$push",
                                                                new Document("sessions", session)));

                assertEquals(1L, result.getModifiedCount());
        }

        private void removeTestSession(int sessionId) {

                mongoTemplate.getCollection("activities").updateOne(
                                new Document("_id", new ObjectId(TEST_ACTIVITY_ID)),
                                new Document("$pull",
                                                new Document("sessions",
                                                                new Document("_id", sessionId))));
        }

        private int getReservedCount(int sessionId) {

                Document activity = mongoTemplate.getCollection("activities")
                                .find(new Document("_id", new ObjectId(TEST_ACTIVITY_ID)))
                                .first();

                assertNotNull(activity);

                return activity.getList("sessions", Document.class)
                                .stream()
                                .filter(session -> sessionId == session.getInteger("_id"))
                                .findFirst()
                                .orElseThrow()
                                .getInteger("reservedCount");
        }

        @Test
        void shouldSwitchGuestActivitySessionAtomically() {

                createTestSession(REPLACEMENT_SESSION_ID, 1, 0, true);

                guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(0, getReservedCount(REPLACEMENT_SESSION_ID));

                Registration updatedRegistration = guestReservationService.switchGuestActivitySession(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID,
                                REPLACEMENT_SESSION_ID);

                assertNotNull(updatedRegistration.getGuest());
                assertNotNull(updatedRegistration.getGuest().getActivities());
                assertEquals(1, updatedRegistration.getGuest().getActivities().size());

                ActivitySelection updatedSelection = updatedRegistration.getGuest().getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, updatedSelection.getActivityId());
                assertEquals(REPLACEMENT_SESSION_ID, updatedSelection.getSessionId());

                Registration persistedRegistration = mongoTemplate.findById(
                                savedRegistrationId, Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getGuest());
                assertNotNull(persistedRegistration.getGuest().getActivities());
                assertEquals(1, persistedRegistration.getGuest().getActivities().size());

                ActivitySelection persistedSelection = persistedRegistration.getGuest().getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, persistedSelection.getActivityId());
                assertEquals(REPLACEMENT_SESSION_ID, persistedSelection.getSessionId());

                assertEquals(0, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));
        }

        @Test
        void shouldPreserveOriginalGuestReservationWhenReplacementSessionIsFull() {

                createTestSession(REPLACEMENT_SESSION_ID, 1, 1, true);

                guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                IllegalStateException exception = assertThrows(
                                IllegalStateException.class,
                                () -> guestReservationService.switchGuestActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                REPLACEMENT_SESSION_ID));

                assertEquals(
                                "Activity session is full, inactive, or unavailable",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                savedRegistrationId, Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getGuest());
                assertNotNull(persistedRegistration.getGuest().getActivities());
                assertEquals(1, persistedRegistration.getGuest().getActivities().size());

                ActivitySelection selection = persistedRegistration.getGuest().getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                assertEquals(TEST_SESSION_ID, selection.getSessionId());

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));
        }

        @Test
        void shouldPreserveOriginalGuestReservationWhenReplacementSessionIsInactive() {

                createTestSession(REPLACEMENT_SESSION_ID, 1, 0, false);

                guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                IllegalStateException exception = assertThrows(
                                IllegalStateException.class,
                                () -> guestReservationService.switchGuestActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                REPLACEMENT_SESSION_ID));

                assertEquals(
                                "Activity session is inactive",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                savedRegistrationId, Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getGuest());
                assertNotNull(persistedRegistration.getGuest().getActivities());
                assertEquals(1, persistedRegistration.getGuest().getActivities().size());

                ActivitySelection selection = persistedRegistration.getGuest().getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                assertEquals(TEST_SESSION_ID, selection.getSessionId());

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(0, getReservedCount(REPLACEMENT_SESSION_ID));
        }

        @Test
        void shouldPreserveOriginalGuestReservationWhenReplacementSessionDoesNotExist() {

                guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                java.util.NoSuchElementException exception = assertThrows(
                                java.util.NoSuchElementException.class,
                                () -> guestReservationService.switchGuestActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                REPLACEMENT_SESSION_ID));

                assertEquals(
                                "Activity session not found",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                savedRegistrationId, Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getGuest());
                assertNotNull(persistedRegistration.getGuest().getActivities());
                assertEquals(1, persistedRegistration.getGuest().getActivities().size());

                ActivitySelection selection = persistedRegistration.getGuest().getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                assertEquals(TEST_SESSION_ID, selection.getSessionId());

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
        }

        @Test
        void shouldRejectGuestSessionSwitchWhenOriginalReservationDoesNotExist() {

                createTestSession(REPLACEMENT_SESSION_ID, 1, 0, true);

                java.util.NoSuchElementException exception = assertThrows(
                                java.util.NoSuchElementException.class,
                                () -> guestReservationService.switchGuestActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                REPLACEMENT_SESSION_ID));

                assertEquals(
                                "Guest activity reservation not found",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                savedRegistrationId, Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getGuest());

                assertTrue(
                                persistedRegistration.getGuest().getActivities() == null
                                                || persistedRegistration.getGuest().getActivities().isEmpty());

                assertEquals(0, getReservedCount(TEST_SESSION_ID));
                assertEquals(0, getReservedCount(REPLACEMENT_SESSION_ID));
        }

        @Test
        void shouldRejectGuestSessionSwitchWhenSessionIdsAreIdentical() {

                guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> guestReservationService.switchGuestActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                TEST_SESSION_ID));

                assertEquals(
                                "Replacement session must differ from current session",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                savedRegistrationId, Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getGuest());
                assertNotNull(persistedRegistration.getGuest().getActivities());
                assertEquals(1, persistedRegistration.getGuest().getActivities().size());

                ActivitySelection selection = persistedRegistration.getGuest().getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                assertEquals(TEST_SESSION_ID, selection.getSessionId());

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
        }

        @Test
        void shouldConsolidateGuestReservationsWhenDestinationIsAlreadyReserved() {

                createTestSession(REPLACEMENT_SESSION_ID, 1, 0, true);

                guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                Registration initialRegistration = guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                REPLACEMENT_SESSION_ID);

                assertEquals(2, initialRegistration.getGuest().getActivities().size());

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));

                Registration updatedRegistration = guestReservationService.switchGuestActivitySession(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID,
                                REPLACEMENT_SESSION_ID);

                assertNotNull(updatedRegistration.getGuest());
                assertNotNull(updatedRegistration.getGuest().getActivities());
                assertEquals(1, updatedRegistration.getGuest().getActivities().size());

                ActivitySelection updatedSelection = updatedRegistration.getGuest().getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, updatedSelection.getActivityId());
                assertEquals(REPLACEMENT_SESSION_ID, updatedSelection.getSessionId());

                Registration persistedRegistration = mongoTemplate.findById(
                                savedRegistrationId, Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getGuest());
                assertNotNull(persistedRegistration.getGuest().getActivities());
                assertEquals(1, persistedRegistration.getGuest().getActivities().size());

                ActivitySelection persistedSelection = persistedRegistration.getGuest().getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, persistedSelection.getActivityId());
                assertEquals(REPLACEMENT_SESSION_ID, persistedSelection.getSessionId());

                assertEquals(0, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));
        }

        @Test
        void shouldPreserveTravelerReservationWhenGuestSwitchesSession() {

                createTestSession(REPLACEMENT_SESSION_ID, 1, 0, true);

                Document activityFilter = new Document("_id", new ObjectId(TEST_ACTIVITY_ID));

                Document sessionFilter = new Document("session._id", TEST_SESSION_ID);

                Document originalActivity = mongoTemplate.getCollection("activities")
                                .find(activityFilter)
                                .first();

                assertNotNull(originalActivity);

                int originalCapacity = originalActivity
                                .getList("sessions", Document.class)
                                .stream()
                                .filter(session -> TEST_SESSION_ID == session.getInteger("_id"))
                                .findFirst()
                                .orElseThrow()
                                .getInteger("maxCapacity");

                try {
                        mongoTemplate.getCollection("activities").updateOne(
                                        activityFilter,
                                        new Document("$set",
                                                        new Document("sessions.$[session].maxCapacity", 2)),
                                        new UpdateOptions().arrayFilters(List.of(sessionFilter)));

                        travelerReservationService.reserveTravelerActivity(
                                        TEST_TRIP_ID,
                                        testTravelerNumber,
                                        TEST_ACTIVITY_ID,
                                        TEST_SESSION_ID);

                        guestReservationService.reserveGuestActivity(
                                        TEST_TRIP_ID,
                                        testTravelerNumber,
                                        TEST_ACTIVITY_ID,
                                        TEST_SESSION_ID);

                        assertEquals(2, getReservedCount(TEST_SESSION_ID));
                        assertEquals(0, getReservedCount(REPLACEMENT_SESSION_ID));

                        guestReservationService.switchGuestActivitySession(
                                        TEST_TRIP_ID,
                                        testTravelerNumber,
                                        TEST_ACTIVITY_ID,
                                        TEST_SESSION_ID,
                                        REPLACEMENT_SESSION_ID);

                        Registration persistedRegistration = mongoTemplate.findById(
                                        savedRegistrationId, Registration.class);

                        assertNotNull(persistedRegistration);
                        assertNotNull(persistedRegistration.getActivities());
                        assertEquals(1, persistedRegistration.getActivities().size());

                        ActivitySelection travelerSelection = persistedRegistration.getActivities().get(0);

                        assertEquals(TEST_ACTIVITY_ID, travelerSelection.getActivityId());
                        assertEquals(TEST_SESSION_ID, travelerSelection.getSessionId());

                        assertTrue(persistedRegistration.isBringingGuest());
                        assertNotNull(persistedRegistration.getGuest());
                        assertNotNull(persistedRegistration.getGuest().getActivities());
                        assertEquals(1, persistedRegistration.getGuest().getActivities().size());

                        ActivitySelection guestSelection = persistedRegistration.getGuest().getActivities().get(0);

                        assertEquals(TEST_ACTIVITY_ID, guestSelection.getActivityId());
                        assertEquals(REPLACEMENT_SESSION_ID, guestSelection.getSessionId());

                        assertEquals(1, getReservedCount(TEST_SESSION_ID));
                        assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));

                } finally {
                        mongoTemplate.getCollection("activities").updateOne(
                                        activityFilter,
                                        new Document("$set",
                                                        new Document("sessions.$[session].maxCapacity",
                                                                        originalCapacity)),
                                        new UpdateOptions().arrayFilters(List.of(sessionFilter)));
                }
        }

        @Test
        void shouldPreserveAnotherGuestReservationForSameActivityWhenSwitchingSession() {

                createTestSession(REPLACEMENT_SESSION_ID, 1, 0, true);
                createTestSession(ADDITIONAL_SESSION_ID, 1, 0, true);

                guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                ADDITIONAL_SESSION_ID);

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(0, getReservedCount(REPLACEMENT_SESSION_ID));
                assertEquals(1, getReservedCount(ADDITIONAL_SESSION_ID));

                Registration updatedRegistration = guestReservationService.switchGuestActivitySession(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID,
                                REPLACEMENT_SESSION_ID);

                assertNotNull(updatedRegistration.getGuest());
                assertNotNull(updatedRegistration.getGuest().getActivities());
                assertEquals(2, updatedRegistration.getGuest().getActivities().size());

                Registration persistedRegistration = mongoTemplate.findById(
                                savedRegistrationId, Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getGuest());
                assertNotNull(persistedRegistration.getGuest().getActivities());

                List<ActivitySelection> selections = persistedRegistration.getGuest().getActivities();

                assertEquals(2, selections.size());

                assertTrue(selections.stream().anyMatch(selection -> TEST_ACTIVITY_ID.equals(selection.getActivityId())
                                && selection.getSessionId() == REPLACEMENT_SESSION_ID));

                assertTrue(selections.stream().anyMatch(selection -> TEST_ACTIVITY_ID.equals(selection.getActivityId())
                                && selection.getSessionId() == ADDITIONAL_SESSION_ID));

                assertFalse(selections.stream().anyMatch(selection -> TEST_ACTIVITY_ID.equals(selection.getActivityId())
                                && selection.getSessionId() == TEST_SESSION_ID));

                assertEquals(0, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));
                assertEquals(1, getReservedCount(ADDITIONAL_SESSION_ID));
        }

        @Test
        void shouldPreserveMultipleGuestReservationsWhenSessionSwitchFails() {

                createTestSession(REPLACEMENT_SESSION_ID, 1, 1, true);
                createTestSession(ADDITIONAL_SESSION_ID, 1, 0, true);

                guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                guestReservationService.reserveGuestActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                ADDITIONAL_SESSION_ID);

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));
                assertEquals(1, getReservedCount(ADDITIONAL_SESSION_ID));

                IllegalStateException exception = assertThrows(
                                IllegalStateException.class,
                                () -> guestReservationService.switchGuestActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                REPLACEMENT_SESSION_ID));

                assertEquals(
                                "Activity session is full, inactive, or unavailable",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                savedRegistrationId, Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getGuest());
                assertNotNull(persistedRegistration.getGuest().getActivities());

                List<ActivitySelection> selections = persistedRegistration.getGuest().getActivities();

                assertEquals(2, selections.size());

                assertTrue(selections.stream().anyMatch(selection -> TEST_ACTIVITY_ID.equals(selection.getActivityId())
                                && selection.getSessionId() == TEST_SESSION_ID));

                assertTrue(selections.stream().anyMatch(selection -> TEST_ACTIVITY_ID.equals(selection.getActivityId())
                                && selection.getSessionId() == ADDITIONAL_SESSION_ID));

                assertFalse(selections.stream().anyMatch(selection -> TEST_ACTIVITY_ID.equals(selection.getActivityId())
                                && selection.getSessionId() == REPLACEMENT_SESSION_ID));

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));
                assertEquals(1, getReservedCount(ADDITIONAL_SESSION_ID));
        }
}