package com.gragroup.compass.controller;

import com.gragroup.compass.model.Registration;
import com.gragroup.compass.service.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gragroup.compass.service.GuestActivityReservationRetryService;

import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import com.gragroup.compass.service.TravelerActivityReservationRetryService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/trips/{tripId}/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;
    private final GuestActivityReservationRetryService guestActivityReservationRetryService;
    private final TravelerActivityReservationRetryService travelerActivityReservationRetryService;

    public RegistrationController(
            RegistrationService registrationService,
            GuestActivityReservationRetryService guestActivityReservationRetryService,
            TravelerActivityReservationRetryService travelerActivityReservationRetryService) {

        this.registrationService = registrationService;
        this.guestActivityReservationRetryService = guestActivityReservationRetryService;
        this.travelerActivityReservationRetryService = travelerActivityReservationRetryService;
    }

    @GetMapping
    public List<Registration> getRegistrationsByTripId(
            @PathVariable String tripId) {

        return registrationService.getRegistrationsByTripId(tripId);
    }

    @GetMapping("/{travelerNumber}")
    public ResponseEntity<Registration> getRegistrationByTravelerNumber(
            @PathVariable String tripId,
            @PathVariable int travelerNumber) {

        return registrationService
                .getRegistrationByTravelerNumber(tripId, travelerNumber)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{travelerNumber}")
    public ResponseEntity<Registration> updateRegistration(
            @PathVariable String tripId,
            @PathVariable int travelerNumber,
            @RequestBody Registration updatedRegistration) {

        try {
            return registrationService
                    .updateRegistration(tripId, travelerNumber, updatedRegistration)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{travelerNumber}/activities/{activityId}/sessions/{sessionId}")
    public ResponseEntity<Registration> reserveTravelerActivity(
            @PathVariable String tripId,
            @PathVariable int travelerNumber,
            @PathVariable String activityId,
            @PathVariable int sessionId) {

        try {
            Registration registration = travelerActivityReservationRetryService.reserveTravelerActivity(
                    tripId, travelerNumber, activityId, sessionId);

            return ResponseEntity.ok(registration);

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();

        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PutMapping("/{travelerNumber}/guest/activities/{activityId}/sessions/{sessionId}")
    public ResponseEntity<Registration> reserveGuestActivity(
            @PathVariable String tripId,
            @PathVariable int travelerNumber,
            @PathVariable String activityId,
            @PathVariable int sessionId) {

        try {
            Registration registration = guestActivityReservationRetryService.reserveGuestActivity(
                    tripId, travelerNumber, activityId, sessionId);

            return ResponseEntity.ok(registration);

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();

        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @DeleteMapping("/{travelerNumber}/activities/{activityId}/sessions/{sessionId}")
    public ResponseEntity<Registration> cancelTravelerActivity(
            @PathVariable String tripId,
            @PathVariable int travelerNumber,
            @PathVariable String activityId,
            @PathVariable int sessionId) {

        try {
            Registration registration = travelerActivityReservationRetryService.cancelTravelerActivity(
                    tripId, travelerNumber, activityId, sessionId);

            return ResponseEntity.ok(registration);

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();

        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @DeleteMapping("/{travelerNumber}/guest/activities/{activityId}/sessions/{sessionId}")
    public ResponseEntity<Registration> cancelGuestActivity(
            @PathVariable String tripId,
            @PathVariable int travelerNumber,
            @PathVariable String activityId,
            @PathVariable int sessionId) {

        try {
            Registration registration = guestActivityReservationRetryService.cancelGuestActivity(
                    tripId, travelerNumber, activityId, sessionId);

            return ResponseEntity.ok(registration);

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();

        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PutMapping("/{travelerNumber}/activities/{activityId}/sessions/{currentSessionId}/switch/{newSessionId}")
    public ResponseEntity<Registration> switchTravelerActivitySession(
            @PathVariable String tripId,
            @PathVariable int travelerNumber,
            @PathVariable String activityId,
            @PathVariable int currentSessionId,
            @PathVariable int newSessionId) {

        try {
            Registration registration = travelerActivityReservationRetryService
                    .switchTravelerActivitySession(
                            tripId,
                            travelerNumber,
                            activityId,
                            currentSessionId,
                            newSessionId);

            return ResponseEntity.ok(registration);

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();

        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PutMapping("/{travelerNumber}/guest/activities/{activityId}/sessions/{currentSessionId}/switch/{newSessionId}")
    public ResponseEntity<Registration> switchGuestActivitySession(
            @PathVariable String tripId,
            @PathVariable int travelerNumber,
            @PathVariable String activityId,
            @PathVariable int currentSessionId,
            @PathVariable int newSessionId) {

        try {
            Registration registration = guestActivityReservationRetryService
                    .switchGuestActivitySession(
                            tripId,
                            travelerNumber,
                            activityId,
                            currentSessionId,
                            newSessionId);

            return ResponseEntity.ok(registration);

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();

        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

}