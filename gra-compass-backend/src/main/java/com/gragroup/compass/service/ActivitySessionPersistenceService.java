package com.gragroup.compass.service;

import com.gragroup.compass.model.Activity;
import com.gragroup.compass.model.ActivitySession;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ActivitySessionPersistenceService {

    private final MongoTemplate mongoTemplate;

    public ActivitySessionPersistenceService(
            MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    private Criteria activityCriteria(
            String tripId,
            String activityId) {

        return Criteria.where("id").is(activityId)
                .and("tripId").is(tripId);
    }

    private Criteria sessionCapacityCriteria(
            int sessionId,
            int maximumReservedCount) {

        return new Criteria().andOperator(
                Criteria.where("_id").is(sessionId),
                new Criteria().orOperator(
                        Criteria.where("reservedCount")
                                .lte(maximumReservedCount),
                        Criteria.where("reservedCount")
                                .exists(false)));
    }

    public Optional<Activity> updateSession(
            String tripId,
            String activityId,
            int sessionId,
            ActivitySession updatedSession) {

        Query query = new Query(
                activityCriteria(tripId, activityId)
                        .and("sessions")
                        .elemMatch(sessionCapacityCriteria(
                                sessionId,
                                updatedSession.getMaxCapacity())));

        Update update = new Update()
                .set("sessions.$.maxCapacity",
                        updatedSession.getMaxCapacity())
                .set("sessions.$.date",
                        updatedSession.getDate())
                .set("sessions.$.time",
                        updatedSession.getTime())
                .set("sessions.$.active",
                        updatedSession.isActive());

        Activity result = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                Activity.class);

        return Optional.ofNullable(result);
    }

    public boolean deleteSession(
            String tripId,
            String activityId,
            int sessionId) {

        Query query = new Query(
                activityCriteria(tripId, activityId)
                        .and("sessions")
                        .elemMatch(sessionCapacityCriteria(
                                sessionId, 0)));

        Update update = new Update()
                .pull("sessions",
                        Query.query(
                                Criteria.where("_id").is(sessionId)));

        return mongoTemplate.updateFirst(
                query,
                update,
                Activity.class).getModifiedCount() == 1;
    }

    public boolean addSession(
            String tripId,
            String activityId,
            ActivitySession session) {

        Query query = new Query(
                activityCriteria(tripId, activityId));

        Update update = new Update()
                .push("sessions", session);

        return mongoTemplate.updateFirst(
                query,
                update,
                Activity.class).getModifiedCount() == 1;
    }
}