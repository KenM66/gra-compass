package com.gragroup.compass.controller;

import com.gragroup.compass.dto.CreateActivityRequest;
import com.gragroup.compass.dto.CreateActivitySessionRequest;
import com.gragroup.compass.model.Activity;
import com.gragroup.compass.model.ActivitySession;
import com.gragroup.compass.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.NoSuchElementException;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/trips/{tripId}/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<Activity>> getActivitiesByTripId(
            @PathVariable String tripId) {

        try {
            return ResponseEntity.ok(
                    activityService.getActivitiesByTripId(tripId));
        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Activity> createActivity(
            @PathVariable String tripId,
            @Valid @RequestBody CreateActivityRequest request) {

        try {
            Activity createdActivity = activityService.createActivity(tripId, request);

            URI location = URI.create(
                    "/api/trips/" + tripId
                            + "/activities/" + createdActivity.getId());

            return ResponseEntity.created(location)
                    .body(createdActivity);

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{activityId}/sessions")
    public ResponseEntity<ActivitySession> createActivitySession(
            @PathVariable String tripId,
            @PathVariable String activityId,
            @Valid @RequestBody CreateActivitySessionRequest request) {

        try {
            ActivitySession createdSession = activityService.createActivitySession(
                    tripId, activityId, request);

            URI location = URI.create(
                    "/api/trips/" + tripId
                            + "/activities/" + activityId
                            + "/sessions/" + createdSession.getId());

            return ResponseEntity.created(location)
                    .body(createdSession);

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{activityId}/sessions/{sessionId}")
    public ResponseEntity<Activity> updateActivitySession(
            @PathVariable String tripId,
            @PathVariable String activityId,
            @PathVariable int sessionId,
            @RequestBody ActivitySession updatedSession) {

        try {
            Activity activity = activityService.updateActivitySession(
                    tripId,
                    activityId,
                    sessionId,
                    updatedSession);

            return ResponseEntity.ok(activity);

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
    }

}