
package com.gragroup.compass.service;

import com.gragroup.compass.model.ActivitySelection;
import com.gragroup.compass.model.Registration;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import com.mongodb.client.model.UpdateOptions;

import static org.junit.jupiter.api.Assertions.*;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@SpringBootTest
class TravelerActivityReservationServiceIntegrationTest {

        private static final String TEST_TRIP_ID = "reservation-test-trip";
        private static final String TEST_ACTIVITY_ID = "6afe4f6965509de638bc199e";
        private static final int TEST_SESSION_ID = 999;
        private static final int REPLACEMENT_SESSION_ID = 1000;
        private static final int ADDITIONAL_SESSION_ID = 1001;

        @Autowired
        private TravelerActivityReservationService travelerReservationService;

        @Autowired
        private MongoTemplate mongoTemplate;

        @Autowired
        private TravelerActivityReservationRetryService retryService;

        private final String testRegistrationId = UUID.randomUUID().toString();

        private final int testTravelerNumber = 2_000_000 + java.util.concurrent.ThreadLocalRandom.current()
                        .nextInt(1_000_000);

        @BeforeEach
        void setUp() {
                Registration registration = new Registration();
                registration.setId(testRegistrationId);
                registration.setTripId(TEST_TRIP_ID);
                registration.setTravelerNumber(testTravelerNumber);
                registration.setFirstName("Test");
                registration.setLastName("Primary Traveler");

                mongoTemplate.save(registration);
        }

        @AfterEach
        void tearDown() {
                mongoTemplate.remove(
                                new org.springframework.data.mongodb.core.query.Query(
                                                org.springframework.data.mongodb.core.query.Criteria
                                                                .where("_id").is(testRegistrationId)),
                                Registration.class);

                mongoTemplate.getCollection("activities").updateOne(
                                new Document("_id", new ObjectId(TEST_ACTIVITY_ID)),
                                new Document("$set",
                                                new Document("sessions.$[session].reservedCount", 0)),
                                new UpdateOptions().arrayFilters(
                                                List.of(new Document("session._id", TEST_SESSION_ID))));

                removeReplacementSession();
                removeTestSession(ADDITIONAL_SESSION_ID);
        }

        @Test
        void shouldSaveTravelerActivityReservation() {

                Registration updatedRegistration = travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertNotNull(updatedRegistration.getActivities());
                assertEquals(1, updatedRegistration.getActivities().size());

                ActivitySelection selection = updatedRegistration.getActivities().get(0);

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
        void shouldNotReserveDuplicateTravelerActivity() {

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                Registration secondReservation = travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertNotNull(secondReservation.getActivities());
                assertEquals(1, secondReservation.getActivities().size());

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
        void shouldRejectReservationWhenSessionIsFull() {

                Document activityFilter = new Document("_id", new ObjectId(TEST_ACTIVITY_ID));

                Document sessionFilter = new Document("session._id", TEST_SESSION_ID);

                Document originalActivity = mongoTemplate
                                .getCollection("activities")
                                .find(activityFilter)
                                .first();

                assertNotNull(originalActivity);

                Document originalSession = originalActivity
                                .getList("sessions", Document.class)
                                .stream()
                                .filter(session -> TEST_SESSION_ID == session.getInteger("_id"))
                                .findFirst()
                                .orElseThrow();

                int originalCapacity = originalSession.getInteger("maxCapacity");

                try {
                        mongoTemplate.getCollection("activities").updateOne(
                                        activityFilter,
                                        new Document("$set",
                                                        new Document(
                                                                        "sessions.$[session].maxCapacity", 0)),
                                        new UpdateOptions().arrayFilters(
                                                        List.of(sessionFilter)));

                        assertThrows(
                                        IllegalStateException.class,
                                        () -> travelerReservationService.reserveTravelerActivity(
                                                        TEST_TRIP_ID,
                                                        testTravelerNumber,
                                                        TEST_ACTIVITY_ID,
                                                        TEST_SESSION_ID));

                        Registration registration = mongoTemplate.findById(
                                        testRegistrationId,
                                        Registration.class);

                        assertNotNull(registration);
                        assertTrue(
                                        registration.getActivities() == null
                                                        || registration.getActivities().isEmpty());

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
        void shouldNotDoubleBookTravelerUnderConcurrentRequests() throws Exception {

                ExecutorService executor = Executors.newFixedThreadPool(2);
                CountDownLatch start = new CountDownLatch(1);

                try {
                        Future<?> first = executor.submit(() -> {
                                start.await();

                                retryService.reserveTravelerActivity(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID);

                                return null;
                        });

                        Future<?> second = executor.submit(() -> {
                                start.await();

                                retryService.reserveTravelerActivity(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID);

                                return null;
                        });

                        start.countDown();

                        first.get(10, TimeUnit.SECONDS);
                        second.get(10, TimeUnit.SECONDS);

                        Registration registration = mongoTemplate.findById(
                                        testRegistrationId,
                                        Registration.class);

                        assertNotNull(registration);
                        assertNotNull(registration.getActivities());
                        assertEquals(1, registration.getActivities().size());

                        Document activity = mongoTemplate.getCollection("activities")
                                        .find(new Document(
                                                        "_id",
                                                        new ObjectId(TEST_ACTIVITY_ID)))
                                        .first();

                        assertNotNull(activity);

                        Document session = activity
                                        .getList("sessions", Document.class)
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
        void shouldCancelTravelerActivityAndReleaseSeat() {

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertEquals(1, getReservedCount());

                Registration updatedRegistration = travelerReservationService.cancelTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertNotNull(updatedRegistration.getActivities());
                assertTrue(updatedRegistration.getActivities().isEmpty());

                assertEquals(0, getReservedCount());

                Registration persistedRegistration = mongoTemplate.findById(
                                testRegistrationId,
                                Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getActivities());
                assertTrue(persistedRegistration.getActivities().isEmpty());
        }

        @Test
        void shouldRejectCancellationWhenReservationDoesNotExist() {

                int originalReservedCount = getReservedCount();

                assertThrows(
                                NoSuchElementException.class,
                                () -> travelerReservationService.cancelTravelerActivity(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID));

                assertEquals(originalReservedCount, getReservedCount());
        }

        @Test
        void shouldNotReleaseSeatTwiceWhenCancellationIsRepeated() {

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                travelerReservationService.cancelTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertEquals(0, getReservedCount());

                assertThrows(
                                NoSuchElementException.class,
                                () -> travelerReservationService.cancelTravelerActivity(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID));

                assertEquals(0, getReservedCount());
        }

        private int getReservedCount() {
                return getReservedCount(TEST_SESSION_ID);
        }

        private int getReservedCount(int sessionId) {

                Document activity = mongoTemplate.getCollection("activities")
                                .find(new Document(
                                                "_id",
                                                new ObjectId(TEST_ACTIVITY_ID)))
                                .first();

                assertNotNull(activity);

                Document session = activity.getList("sessions", Document.class)
                                .stream()
                                .filter(item -> sessionId == item.getInteger("_id"))
                                .findFirst()
                                .orElseThrow();

                return session.getInteger("reservedCount");
        }

        @Test
        void shouldRollbackCancellationWhenSeatReleaseFails() {

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertEquals(1, getReservedCount());

                Document activityFilter = new Document(
                                "_id", new ObjectId(TEST_ACTIVITY_ID));

                Document sessionFilter = new Document(
                                "session._id", TEST_SESSION_ID);

                try {
                        mongoTemplate.getCollection("activities").updateOne(
                                        activityFilter,
                                        new Document("$set",
                                                        new Document("sessions.$[session].reservedCount", 0)),
                                        new UpdateOptions().arrayFilters(
                                                        List.of(sessionFilter)));

                        assertThrows(
                                        IllegalStateException.class,
                                        () -> travelerReservationService.cancelTravelerActivity(
                                                        TEST_TRIP_ID,
                                                        testTravelerNumber,
                                                        TEST_ACTIVITY_ID,
                                                        TEST_SESSION_ID));

                        Registration persistedRegistration = mongoTemplate.findById(
                                        testRegistrationId,
                                        Registration.class);

                        assertNotNull(persistedRegistration);
                        assertNotNull(persistedRegistration.getActivities());
                        assertEquals(1, persistedRegistration.getActivities().size());

                        ActivitySelection selection = persistedRegistration.getActivities().get(0);

                        assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                        assertEquals(TEST_SESSION_ID, selection.getSessionId());

                        assertEquals(0, getReservedCount());

                } finally {
                        mongoTemplate.getCollection("activities").updateOne(
                                        activityFilter,
                                        new Document("$set",
                                                        new Document("sessions.$[session].reservedCount", 1)),
                                        new UpdateOptions().arrayFilters(
                                                        List.of(sessionFilter)));
                }
        }

        private void createReplacementSession(
                        int maxCapacity,
                        int reservedCount,
                        boolean active) {

                createTestSession(
                                REPLACEMENT_SESSION_ID,
                                maxCapacity,
                                reservedCount,
                                active);
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

                com.mongodb.client.result.UpdateResult result = mongoTemplate.getCollection("activities").updateOne(
                                new Document("_id", new ObjectId(TEST_ACTIVITY_ID))
                                                .append("sessions._id",
                                                                new Document("$ne", sessionId)),
                                new Document("$push",
                                                new Document("sessions", session)));

                assertEquals(1L, result.getModifiedCount());
        }

        private void removeReplacementSession() {

                removeTestSession(REPLACEMENT_SESSION_ID);
        }

        private void removeTestSession(int sessionId) {

                mongoTemplate.getCollection("activities").updateOne(
                                new Document("_id", new ObjectId(TEST_ACTIVITY_ID)),
                                new Document("$pull",
                                                new Document("sessions",
                                                                new Document("_id", sessionId))));
        }

        @Test
        void shouldSwitchTravelerActivitySessionAtomically() {

                createReplacementSession(1, 0, true);

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(0, getReservedCount(REPLACEMENT_SESSION_ID));

                Registration updatedRegistration = travelerReservationService.switchTravelerActivitySession(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID,
                                REPLACEMENT_SESSION_ID);

                assertNotNull(updatedRegistration.getActivities());
                assertEquals(1, updatedRegistration.getActivities().size());

                ActivitySelection selection = updatedRegistration.getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                assertEquals(REPLACEMENT_SESSION_ID, selection.getSessionId());

                assertEquals(0, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));

                Registration persistedRegistration = mongoTemplate.findById(
                                testRegistrationId,
                                Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getActivities());
                assertEquals(1, persistedRegistration.getActivities().size());

                ActivitySelection persistedSelection = persistedRegistration.getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, persistedSelection.getActivityId());
                assertEquals(REPLACEMENT_SESSION_ID,
                                persistedSelection.getSessionId());
        }

        @Test
        void shouldPreserveOriginalReservationWhenReplacementSessionIsFull() {

                createReplacementSession(1, 1, true);

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));

                IllegalStateException exception = assertThrows(
                                IllegalStateException.class,
                                () -> travelerReservationService.switchTravelerActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                REPLACEMENT_SESSION_ID));

                assertEquals(
                                "Activity session is full, inactive, or unavailable",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                testRegistrationId,
                                Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getActivities());
                assertEquals(1, persistedRegistration.getActivities().size());

                ActivitySelection selection = persistedRegistration.getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                assertEquals(TEST_SESSION_ID, selection.getSessionId());

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));
        }

        @Test
        void shouldPreserveOriginalReservationWhenReplacementSessionIsInactive() {

                createReplacementSession(1, 0, false);

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(0, getReservedCount(REPLACEMENT_SESSION_ID));

                IllegalStateException exception = assertThrows(
                                IllegalStateException.class,
                                () -> travelerReservationService.switchTravelerActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                REPLACEMENT_SESSION_ID));

                assertEquals(
                                "Activity session is inactive",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                testRegistrationId,
                                Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getActivities());
                assertEquals(1, persistedRegistration.getActivities().size());

                ActivitySelection selection = persistedRegistration.getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                assertEquals(TEST_SESSION_ID, selection.getSessionId());

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(0, getReservedCount(REPLACEMENT_SESSION_ID));
        }

        @Test
        void shouldPreserveOriginalReservationWhenReplacementSessionDoesNotExist() {

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertEquals(1, getReservedCount(TEST_SESSION_ID));

                NoSuchElementException exception = assertThrows(
                                NoSuchElementException.class,
                                () -> travelerReservationService.switchTravelerActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                REPLACEMENT_SESSION_ID));

                assertEquals(
                                "Activity session not found",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                testRegistrationId,
                                Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getActivities());
                assertEquals(1, persistedRegistration.getActivities().size());

                ActivitySelection selection = persistedRegistration.getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                assertEquals(TEST_SESSION_ID, selection.getSessionId());

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
        }

        @Test
        void shouldRejectSessionSwitchWhenOriginalReservationDoesNotExist() {

                createReplacementSession(1, 0, true);

                assertEquals(0, getReservedCount(TEST_SESSION_ID));
                assertEquals(0, getReservedCount(REPLACEMENT_SESSION_ID));

                NoSuchElementException exception = assertThrows(
                                NoSuchElementException.class,
                                () -> travelerReservationService.switchTravelerActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                REPLACEMENT_SESSION_ID));

                assertEquals(
                                "Traveler activity reservation not found",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                testRegistrationId,
                                Registration.class);

                assertNotNull(persistedRegistration);

                assertTrue(
                                persistedRegistration.getActivities() == null
                                                || persistedRegistration.getActivities().isEmpty());

                assertEquals(0, getReservedCount(TEST_SESSION_ID));
                assertEquals(0, getReservedCount(REPLACEMENT_SESSION_ID));
        }

        @Test
        void shouldRejectSessionSwitchWhenSessionIdsAreIdentical() {

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                assertEquals(1, getReservedCount(TEST_SESSION_ID));

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> travelerReservationService.switchTravelerActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                TEST_SESSION_ID));

                assertEquals(
                                "Replacement session must differ from current session",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                testRegistrationId,
                                Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getActivities());
                assertEquals(1, persistedRegistration.getActivities().size());

                ActivitySelection selection = persistedRegistration.getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                assertEquals(TEST_SESSION_ID, selection.getSessionId());

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
        }

        @Test
        void shouldConsolidateReservationsWhenDestinationIsAlreadyReserved() {

                createReplacementSession(1, 0, true);

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                Registration originalRegistration = travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                REPLACEMENT_SESSION_ID);

                assertNotNull(originalRegistration.getActivities());
                assertEquals(2, originalRegistration.getActivities().size());

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));

                Registration updatedRegistration = travelerReservationService.switchTravelerActivitySession(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID,
                                REPLACEMENT_SESSION_ID);

                assertNotNull(updatedRegistration.getActivities());
                assertEquals(1, updatedRegistration.getActivities().size());

                ActivitySelection selection = updatedRegistration.getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, selection.getActivityId());
                assertEquals(REPLACEMENT_SESSION_ID, selection.getSessionId());

                assertEquals(0, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));

                Registration persistedRegistration = mongoTemplate.findById(
                                testRegistrationId,
                                Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getActivities());
                assertEquals(1, persistedRegistration.getActivities().size());

                ActivitySelection persistedSelection = persistedRegistration.getActivities().get(0);

                assertEquals(TEST_ACTIVITY_ID, persistedSelection.getActivityId());
                assertEquals(REPLACEMENT_SESSION_ID,
                                persistedSelection.getSessionId());
        }

        @Test
        void shouldPreserveAnotherTravelerReservationForSameActivityWhenSwitchingSession() {

                createTestSession(REPLACEMENT_SESSION_ID, 1, 0, true);
                createTestSession(ADDITIONAL_SESSION_ID, 1, 0, true);

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                ADDITIONAL_SESSION_ID);

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(0, getReservedCount(REPLACEMENT_SESSION_ID));
                assertEquals(1, getReservedCount(ADDITIONAL_SESSION_ID));

                Registration updatedRegistration = travelerReservationService.switchTravelerActivitySession(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID,
                                REPLACEMENT_SESSION_ID);

                assertNotNull(updatedRegistration.getActivities());
                assertEquals(2, updatedRegistration.getActivities().size());

                Registration persistedRegistration = mongoTemplate.findById(
                                testRegistrationId, Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getActivities());

                List<ActivitySelection> selections = persistedRegistration.getActivities();

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
        void shouldPreserveMultipleTravelerReservationsWhenSessionSwitchFails() {

                createTestSession(REPLACEMENT_SESSION_ID, 1, 1, true);
                createTestSession(ADDITIONAL_SESSION_ID, 1, 0, true);

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                TEST_SESSION_ID);

                travelerReservationService.reserveTravelerActivity(
                                TEST_TRIP_ID,
                                testTravelerNumber,
                                TEST_ACTIVITY_ID,
                                ADDITIONAL_SESSION_ID);

                assertEquals(1, getReservedCount(TEST_SESSION_ID));
                assertEquals(1, getReservedCount(REPLACEMENT_SESSION_ID));
                assertEquals(1, getReservedCount(ADDITIONAL_SESSION_ID));

                IllegalStateException exception = assertThrows(
                                IllegalStateException.class,
                                () -> travelerReservationService.switchTravelerActivitySession(
                                                TEST_TRIP_ID,
                                                testTravelerNumber,
                                                TEST_ACTIVITY_ID,
                                                TEST_SESSION_ID,
                                                REPLACEMENT_SESSION_ID));

                assertEquals(
                                "Activity session is full, inactive, or unavailable",
                                exception.getMessage());

                Registration persistedRegistration = mongoTemplate.findById(
                                testRegistrationId, Registration.class);

                assertNotNull(persistedRegistration);
                assertNotNull(persistedRegistration.getActivities());

                List<ActivitySelection> selections = persistedRegistration.getActivities();

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
