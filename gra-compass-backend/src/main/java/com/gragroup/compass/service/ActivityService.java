package com.gragroup.compass.service;

import com.gragroup.compass.dto.CreateActivityRequest;
import com.gragroup.compass.model.Activity;
import com.gragroup.compass.repository.ActivityRepository;
import com.gragroup.compass.repository.TripRepository;
import org.springframework.stereotype.Service;
import com.gragroup.compass.repository.RegistrationRepository;
import com.gragroup.compass.model.Registration;
import com.gragroup.compass.model.ActivitySelection;
import java.util.List;
import java.util.NoSuchElementException;

import com.gragroup.compass.dto.CreateActivitySessionRequest;
import com.gragroup.compass.model.ActivitySession;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;
    private final RegistrationRepository registrationRepository;
    private final SessionIdService sessionIdService;
    private final ActivitySessionPersistenceService sessionPersistenceService;

    public ActivityService(
            ActivityRepository activityRepository,
            TripRepository tripRepository,
            RegistrationRepository registrationRepository,
            SessionIdService sessionIdService,
            ActivitySessionPersistenceService sessionPersistenceService) {

        this.activityRepository = activityRepository;
        this.tripRepository = tripRepository;
        this.registrationRepository = registrationRepository;
        this.sessionIdService = sessionIdService;
        this.sessionPersistenceService = sessionPersistenceService;
    }

    private List<Registration> getRegistrationsForTrip(String tripId) {
        return registrationRepository.findByTripId(tripId);
    }

    private boolean matchesSession(
            ActivitySelection selection,
            String activityId,
            int sessionId) {

        return activityId.equals(selection.getActivityId())
                && selection.getSessionId() == sessionId;
    }

    private long countSessionRegistrations(
            String tripId,
            String activityId,
            int sessionId) {

        List<Registration> registrations = getRegistrationsForTrip(tripId);

        long travelerCount = registrations.stream()
                .filter(registration -> registration.getActivities() != null)
                .flatMap(registration -> registration.getActivities().stream())
                .filter(selection -> matchesSession(
                        selection, activityId, sessionId))
                .count();

        long guestCount = registrations.stream()
                .filter(registration -> registration.getGuest() != null)
                .filter(registration -> registration.getGuest().getActivities() != null)
                .flatMap(registration -> registration.getGuest().getActivities().stream())
                .filter(selection -> matchesSession(
                        selection, activityId, sessionId))
                .count();

        return travelerCount + guestCount;
    }

    private void validateSessionCapacity(
            String tripId,
            String activityId,
            int sessionId,
            int newCapacity) {

        long registeredCount = countSessionRegistrations(tripId, activityId, sessionId);

        if (newCapacity < registeredCount) {
            throw new IllegalArgumentException(
                    "Session capacity cannot be less than the number of registered travelers.");
        }
    }

    private ActivitySession findSession(Activity activity, int sessionId) {
        return activity.getSessions().stream()
                .filter(session -> session.getId() == sessionId)
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException(
                        "Activity session not found: " + sessionId));
    }

    public Activity updateActivitySession(
            String tripId,
            String activityId,
            int sessionId,
            ActivitySession updatedSession) {

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Activity not found: " + activityId));

        if (!activity.getTripId().equals(tripId)) {
            throw new NoSuchElementException(
                    "Activity not found for trip: " + tripId);
        }

        findSession(activity, sessionId);

        if (updatedSession.getMaxCapacity() < 1) {
            throw new IllegalArgumentException(
                    "Session capacity must be at least 1.");
        }

        validateSessionCapacity(
                tripId,
                activityId,
                sessionId,
                updatedSession.getMaxCapacity());

        return sessionPersistenceService.updateSession(
                tripId,
                activityId,
                sessionId,
                updatedSession)
                .orElseThrow(() -> {
                    Activity currentActivity = activityRepository
                            .findById(activityId)
                            .orElseThrow(() -> new NoSuchElementException(
                                    "Activity not found: " + activityId));

                    if (!currentActivity.getTripId().equals(tripId)) {
                        return new NoSuchElementException(
                                "Activity not found for trip: " + tripId);
                    }

                    findSession(currentActivity, sessionId);

                    return new IllegalArgumentException(
                            "Session capacity cannot be less than "
                                    + "the number of reserved seats.");
                });
    }

    public void deleteActivitySession(
            String tripId,
            String activityId,
            int sessionId) {

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Activity not found: " + activityId));

        if (!activity.getTripId().equals(tripId)) {
            throw new NoSuchElementException(
                    "Activity not found for trip: " + tripId);
        }

        findSession(activity, sessionId);

        long registeredCount = countSessionRegistrations(
                tripId,
                activityId,
                sessionId);

        if (registeredCount > 0) {
            throw new IllegalStateException(
                    "Cannot delete a session with registered travelers or guests.");
        }

        boolean deleted = sessionPersistenceService.deleteSession(
                tripId,
                activityId,
                sessionId);

        if (!deleted) {
            Activity currentActivity = activityRepository
                    .findById(activityId)
                    .orElseThrow(() -> new NoSuchElementException(
                            "Activity not found: " + activityId));

            if (!currentActivity.getTripId().equals(tripId)) {
                throw new NoSuchElementException(
                        "Activity not found for trip: " + tripId);
            }

            findSession(currentActivity, sessionId);

            throw new IllegalStateException(
                    "Cannot delete a session with reserved seats.");
        }
    }

    public List<Activity> getActivitiesByTripId(String tripId) {
        if (!tripRepository.existsById(tripId)) {
            throw new NoSuchElementException("Trip not found: " + tripId);
        }

        return activityRepository.findByTripId(tripId);
    }

    public Activity createActivity(String tripId, CreateActivityRequest request) {
        if (!tripRepository.existsById(tripId)) {
            throw new NoSuchElementException("Trip not found: " + tripId);
        }

        Activity activity = new Activity();

        activity.setTripId(tripId);
        activity.setType(request.getType());
        activity.setName(request.getName());

        return activityRepository.save(activity);
    }

    public ActivitySession createActivitySession(
            String tripId,
            String activityId,
            CreateActivitySessionRequest request) {

        if (!tripRepository.existsById(tripId)) {
            throw new NoSuchElementException("Trip not found: " + tripId);
        }

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Activity not found: " + activityId));

        if (!activity.getTripId().equals(tripId)) {
            throw new NoSuchElementException(
                    "Activity not found for trip: " + tripId);
        }

        ActivitySession session = new ActivitySession();

        session.setId(sessionIdService.getNextSessionId());
        session.setDate(request.getDate());
        session.setTime(request.getTime());
        session.setMaxCapacity(request.getMaxCapacity());
        session.setActive(true);

        session.setReservedCount(0);

        boolean added = sessionPersistenceService.addSession(
                tripId,
                activityId,
                session);

        if (!added) {
            throw new NoSuchElementException(
                    "Activity not found: " + activityId);
        }

        return session;
    }
}