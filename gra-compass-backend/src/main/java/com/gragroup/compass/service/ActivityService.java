package com.gragroup.compass.service;

import com.gragroup.compass.dto.CreateActivityRequest;
import com.gragroup.compass.model.Activity;
import com.gragroup.compass.repository.ActivityRepository;
import com.gragroup.compass.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

import com.gragroup.compass.dto.CreateActivitySessionRequest;
import com.gragroup.compass.model.ActivitySession;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;
    private final SessionIdService sessionIdService;

    public ActivityService(
            ActivityRepository activityRepository,
            TripRepository tripRepository,
            SessionIdService sessionIdService) {
        this.activityRepository = activityRepository;
        this.tripRepository = tripRepository;
        this.sessionIdService = sessionIdService;
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