package com.gragroup.compass.service;

import com.gragroup.compass.repository.ActivityRepository;
import com.gragroup.compass.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import com.gragroup.compass.model.Registration;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import com.gragroup.compass.model.Activity;
import com.gragroup.compass.model.ActivitySelection;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import com.mongodb.client.result.UpdateResult;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;

@Service
public class GuestActivityReservationService {

        private final RegistrationRepository registrationRepository;
        private final ActivityRepository activityRepository;
        private final ActivityReservationService activityReservationService;
        private final MongoTemplate mongoTemplate;

        public GuestActivityReservationService(
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
        public Registration reserveGuestActivity(
                        String tripId,
                        int travelerNumber,
                        String activityId,
                        int sessionId) {

                Registration registration = registrationRepository
                                .findByTripIdAndTravelerNumber(tripId, travelerNumber)
                                .orElseThrow(() -> new NoSuchElementException(
                                                "Registration not found"));

                validateGuest(registration);

                Activity activity = findAndValidateActivity(
                                tripId, activityId, sessionId);

                if (hasGuestReservation(registration, activityId, sessionId)) {
                        return registration;
                }

                validateSessionActive(activity, sessionId);

                ActivitySelection selection = createActivitySelection(
                                activity, sessionId);

                boolean seatReserved = activityReservationService.reserveSeat(
                                tripId,
                                activityId,
                                sessionId);

                if (!seatReserved) {
                        throw new IllegalStateException(
                                        "Activity session is full, inactive, or unavailable");
                }
                boolean selectionAdded = addGuestActivitySelection(
                                registration, selection);

                if (!selectionAdded) {
                        throw new IllegalStateException(
                                        "Guest reservation could not be saved");
                }

                return registrationRepository.findById(registration.getId())
                                .orElseThrow(() -> new IllegalStateException(
                                                "Registration disappeared after reservation"));
        }

        @Transactional
        public Registration cancelGuestActivity(
                        String tripId,
                        int travelerNumber,
                        String activityId,
                        int sessionId) {

                Registration registration = registrationRepository
                                .findByTripIdAndTravelerNumber(tripId, travelerNumber)
                                .orElseThrow(() -> new NoSuchElementException(
                                                "Registration not found"));

                validateGuest(registration);

                if (!hasGuestReservation(registration, activityId, sessionId)) {
                        throw new NoSuchElementException(
                                        "Guest activity reservation not found");
                }

                boolean selectionRemoved = removeGuestActivitySelection(
                                registration, activityId, sessionId);

                if (!selectionRemoved) {
                        throw new IllegalStateException(
                                        "Guest reservation could not be removed");
                }

                boolean seatReleased = activityReservationService.releaseSeat(
                                tripId, activityId, sessionId);

                if (!seatReleased) {
                        throw new IllegalStateException(
                                        "Reserved seat could not be released");
                }

                return registrationRepository.findById(registration.getId())
                                .orElseThrow(() -> new IllegalStateException(
                                                "Registration disappeared after cancellation"));
        }

        @Transactional
        public Registration switchGuestActivitySession(
                        String tripId,
                        int travelerNumber,
                        String activityId,
                        int currentSessionId,
                        int newSessionId) {

                if (currentSessionId == newSessionId) {
                        throw new IllegalArgumentException(
                                        "Replacement session must differ from current session");
                }

                cancelGuestActivity(
                                tripId,
                                travelerNumber,
                                activityId,
                                currentSessionId);

                return reserveGuestActivity(
                                tripId,
                                travelerNumber,
                                activityId,
                                newSessionId);
        }

        private void validateSessionActive(Activity activity, int sessionId) {
                boolean sessionActive = activity.getSessions().stream()
                                .filter(session -> session.getId() == sessionId)
                                .findFirst()
                                .orElseThrow()
                                .isActive();

                if (!sessionActive) {
                        throw new IllegalStateException(
                                        "Activity session is inactive");
                }
        }

        private Activity findAndValidateActivity(
                        String tripId, String activityId, int sessionId) {

                Activity activity = activityRepository.findById(activityId)
                                .orElseThrow(() -> new NoSuchElementException(
                                                "Activity not found"));

                if (!tripId.equals(activity.getTripId())) {
                        throw new NoSuchElementException(
                                        "Activity does not belong to this trip");
                }

                boolean sessionExists = activity.getSessions() != null
                                && activity.getSessions().stream()
                                                .anyMatch(session -> session.getId() == sessionId);

                if (!sessionExists) {
                        throw new NoSuchElementException(
                                        "Activity session not found");
                }

                return activity;
        }

        private void validateGuest(Registration registration) {
                if (!registration.isBringingGuest() || registration.getGuest() == null) {
                        throw new IllegalArgumentException(
                                        "Registration does not have a guest");
                }
        }

        private boolean hasGuestReservation(
                        Registration registration,
                        String activityId,
                        int sessionId) {

                return registration.getGuest().getActivities() != null
                                && registration.getGuest().getActivities().stream()
                                                .anyMatch(selection -> activityId.equals(selection.getActivityId())
                                                                && sessionId == selection.getSessionId());
        }

        private ActivitySelection createActivitySelection(
                        Activity activity, int sessionId) {

                ActivitySelection selection = new ActivitySelection();

                selection.setActivityId(activity.getId());
                selection.setSessionId(sessionId);
                selection.setType(activity.getType());
                selection.setName(activity.getName());

                return selection;
        }

        private boolean addGuestActivitySelection(
                        Registration registration,
                        ActivitySelection selection) {

                Query query = new Query(
                                Criteria.where("_id").is(registration.getId())
                                                .and("bringingGuest").is(true)
                                                .and("guest").ne(null)
                                                .and("guest.activities").not().elemMatch(
                                                                Criteria.where("activityId")
                                                                                .is(selection.getActivityId())
                                                                                .and("sessionId")
                                                                                .is(selection.getSessionId())));

                Update update = new Update()
                                .push("guest.activities", selection);

                UpdateResult result = mongoTemplate.updateFirst(
                                query, update, Registration.class);

                return result.getModifiedCount() == 1;
        }

        private boolean removeGuestActivitySelection(
                        Registration registration,
                        String activityId,
                        int sessionId) {

                Query query = new Query(
                                Criteria.where("_id").is(registration.getId())
                                                .and("bringingGuest").is(true)
                                                .and("guest").ne(null)
                                                .and("guest.activities").elemMatch(
                                                                Criteria.where("activityId").is(activityId)
                                                                                .and("sessionId").is(sessionId)));

                Update update = new Update()
                                .pull("guest.activities",
                                                new Document("activityId", activityId)
                                                                .append("sessionId", sessionId));

                UpdateResult result = mongoTemplate.updateFirst(
                                query, update, Registration.class);

                return result.getModifiedCount() == 1;
        }

}