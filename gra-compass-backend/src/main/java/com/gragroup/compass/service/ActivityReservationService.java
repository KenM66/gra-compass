
package com.gragroup.compass.service;

import com.mongodb.client.result.UpdateResult;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.BasicQuery;
import org.springframework.data.mongodb.core.query.BasicUpdate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityReservationService {

    private final MongoTemplate mongoTemplate;

    public ActivityReservationService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public boolean reserveSeat(String tripId, String activityId, int sessionId) {

        Document sessionCondition = new Document("$and", List.of(
                new Document("$eq", List.of("$$session._id", sessionId)),
                new Document("$eq", List.of("$$session.active", true)),
                new Document("$lt", List.of(
                        new Document("$ifNull", List.of("$$session.reservedCount", 0)),
                        "$$session.maxCapacity"))));

        Document filter = new Document("_id", new org.bson.types.ObjectId(activityId))
                .append("tripId", tripId)
                .append("$expr", new Document("$anyElementTrue",
                        new Document("$map", new Document("input", "$sessions")
                                .append("as", "session")
                                .append("in", sessionCondition))));

        Document update = new Document("$inc",
                new Document("sessions.$[session].reservedCount", 1));

        BasicQuery query = new BasicQuery(filter);

        BasicUpdate basicUpdate = new BasicUpdate(update);
        basicUpdate.filterArray("session._id", sessionId);

        UpdateResult result = mongoTemplate.updateFirst(
                query,
                basicUpdate,
                "activities");

        return result.getModifiedCount() == 1;
    }
}
