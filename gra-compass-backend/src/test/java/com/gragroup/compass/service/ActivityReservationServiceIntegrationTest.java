
package com.gragroup.compass.service;

import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ActivityReservationServiceIntegrationTest {

        @Autowired
        private ActivityReservationService reservationService;

        @Autowired
        private MongoTemplate mongoTemplate;

        @Test
        void shouldReserveOneSeatAndRejectOverbooking() {

                String activityId = "6afe4f6965509de638bc199e";
                String tripId = "reservation-test-trip";
                int sessionId = 999;

                try {
                        boolean firstReservation = reservationService.reserveSeat(
                                        tripId, activityId, sessionId);

                        boolean secondReservation = reservationService.reserveSeat(
                                        tripId, activityId, sessionId);

                        assertTrue(firstReservation);
                        assertFalse(secondReservation);

                        Document activity = mongoTemplate
                                        .getCollection("activities")
                                        .find(new Document("_id",
                                                        new org.bson.types.ObjectId(activityId)))
                                        .first();

                        assertNotNull(activity);

                        Document session = activity.getList(
                                        "sessions", Document.class).get(0);

                        assertEquals(1, session.getInteger("reservedCount"));

                } finally {
                        mongoTemplate.getCollection("activities").updateOne(
                                        new Document("_id",
                                                        new org.bson.types.ObjectId(activityId)),
                                        new Document("$set",
                                                        new Document("sessions.$[session].reservedCount", 0)),
                                        new com.mongodb.client.model.UpdateOptions()
                                                        .arrayFilters(java.util.List.of(
                                                                        new Document("session._id", sessionId))));
                }
        }

        @Autowired
        private ActivityReservationRollbackTestService rollbackTestService;

        @Test
        void shouldRollbackReservationWhenTransactionFails() {

                String activityId = "6afe4f6965509de638bc199e";
                String tripId = "reservation-test-trip";
                int sessionId = 999;

                org.bson.types.ObjectId objectId = new org.bson.types.ObjectId(activityId);

                // Verify the temporary session starts with no reservations.
                Document before = mongoTemplate.getCollection("activities")
                                .find(new Document("_id", objectId))
                                .first();

                assertNotNull(before);
                assertEquals(0, before.getList("sessions", Document.class)
                                .get(0).getInteger("reservedCount"));

                // Reserve a seat, then deliberately fail the transaction.
                assertThrows(
                                IllegalStateException.class,
                                () -> rollbackTestService.reserveThenFail(
                                                tripId, activityId, sessionId));

                // The reservation must have been rolled back.
                Document after = mongoTemplate.getCollection("activities")
                                .find(new Document("_id", objectId))
                                .first();

                assertNotNull(after);
                assertEquals(0, after.getList("sessions", Document.class)
                                .get(0).getInteger("reservedCount"));
        }

}
