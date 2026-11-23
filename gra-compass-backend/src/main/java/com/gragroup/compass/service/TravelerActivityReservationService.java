
package com.gragroup.compass.service;

import com.gragroup.compass.model.Activity;
import com.gragroup.compass.model.ActivitySelection;
import com.gragroup.compass.model.Registration;
import com.gragroup.compass.repository.ActivityRepository;
import com.gragroup.compass.repository.RegistrationRepository;
import com.mongodb.client.result.UpdateResult;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
public class TravelerActivityReservationService {

    private final RegistrationRepository registrationRepository;
    private final ActivityRepository activityRepository;
    private final ActivityReservationService activityReservationService;
    private final MongoTemplate mongoTemplate;

    public TravelerActivityReservationService(
            RegistrationRepository registrationRepository,
            ActivityRepository activityRepository,
            ActivityReservationService activityReservationService,
            MongoTemplate mongoTemplate) {

        this.registrationRepository = registrationRepository;
        this.activityRepository = activityRepository;
        this.activityReservationService = activityReservationService;
        this.mongoTemplate = mongoTemplate;
    }

    @Transactional
    public Registration reserveTravelerActivity(
            String tripId,
            int travelerNumber,
            String activityId,
            int sessionId) {

        Registration registration = registrationRepository
                .findByTripIdAndTravelerNumber(tripId, travelerNumber)
                .orElseThrow(() -> new NoSuchElementException("Registration not found"));

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new NoSuchElementException("Activity not found"));

        if (!tripId.equals(activity.getTripId())) {
            throw new NoSuchElementException(
                    "Activity does not belong to this trip");
        }

        boolean sessionExists = activity.getSessions() != null
                && activity.getSessions().stream()
                        .anyMatch(session -> session.getId() == sessionId);

        if (!sessionExists) {
            throw new NoSuchElementException("Activity session not found");
        }

        boolean alreadyReserved = registration.getActivities() != null
                && registration.getActivities().stream()
                        .anyMatch(selection -> activityId.equals(selection.getActivityId())
                                && sessionId == selection.getSessionId());

        if (alreadyReserved) {
            return registration;
        }

        boolean sessionActive = activity.getSessions().stream()
                .filter(session -> session.getId() == sessionId)
                .findFirst()
                .orElseThrow()
                .isActive();

        if (!sessionActive) {
            throw new IllegalStateException("Activity session is inactive");
        }

        ActivitySelection selection = new ActivitySelection();
        selection.setActivityId(activity.getId());
        selection.setSessionId(sessionId);
        selection.setType(activity.getType());
        selection.setName(activity.getName());

        boolean seatReserved = activityReservationService.reserveSeat(
                tripId, activityId, sessionId);

        if (!seatReserved) {
            throw new IllegalStateException(
                    "Activity session is full, inactive, or unavailable");
        }

        Query query = new Query(
                Criteria.where("_id").is(registration.getId())
                        .and("activities").not().elemMatch(
                                Criteria.where("activityId").is(activityId)
                                        .and("sessionId").is(sessionId)));

        Update update = new Update().push("activities", selection);

        UpdateResult result = mongoTemplate.updateFirst(
                query, update, Registration.class);

        if (result.getModifiedCount() != 1) {
            throw new IllegalStateException(
                    "Traveler reservation could not be saved");
        }

        return registrationRepository.findById(registration.getId())
                .orElseThrow(() -> new IllegalStateException(
                        "Registration disappeared after reservation"));
    }
}
