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

    public ActivityService(
            ActivityRepository activityRepository,
            TripRepository tripRepository,
            RegistrationRepository registrationRepository,
            SessionIdService sessionIdService) {
        this.activityRepository = activityRepository;
        this.tripRepository = tripRepository;
        this.registrationRepository = registrationRepository;
        this.sessionIdService = sessionIdService;
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

        return getRegistrationsForTrip(tripId).stream()
                .filter(registration -> registration.getActivities() != null)
                .flatMap(registration -> registration.getActivities().stream())
                .filter(selection -> matchesSession(selection, activityId, sessionId))
                .count()
                + countGuestSessionRegistrations(tripId, activityId, sessionId);
    }

    private long countGuestSessionRegistrations(
            String tripId,
            String activityId,
            int sessionId) {

        return getRegistrationsForTrip(tripId).stream()
                .filter(registration -> registration.getGuest() != null)
                .filter(registration -> registration.getGuest().getActivities() != null)
                .flatMap(registration -> registration.getGuest().getActivities().stream())
                .filter(selection -> matchesSession(selection, activityId, sessionId))
                .count();
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

        ActivitySession session = findSession(activity, sessionId);

        validateSessionCapacity(
                tripId,
                activityId,
                sessionId,
                updatedSession.getMaxCapacity());

        session.setMaxCapacity(updatedSession.getMaxCapacity());
        session.setDate(updatedSession.getDate());
        session.setTime(updatedSession.getTime());
        session.setActive(updatedSession.isActive());

        return activityRepository.save(activity);
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

        activity.getSessions().add(session);

        activityRepository.save(activity);

        return session;
    }
}