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
        private MongoTemplate mongoTemplate;
        private static final String TEST_TRIP_ID = "reservation-test-trip";

        private static final String TEST_ACTIVITY_ID = "6afe4f6965509de638bc199e";

        private static final int TEST_SESSION_ID = 999;

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

}