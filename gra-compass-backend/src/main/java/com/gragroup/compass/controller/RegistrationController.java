package com.gragroup.compass.controller;

import com.gragroup.compass.model.Registration;
import com.gragroup.compass.service.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gragroup.compass.service.GuestActivityReservationRetryService;

import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/trips/{tripId}/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;
    private final GuestActivityReservationRetryService guestActivityReservationRetryService;

    public RegistrationController(
            RegistrationService registrationService,
            GuestActivityReservationRetryService guestActivityReservationRetryService) {

        this.registrationService = registrationService;
        this.guestActivityReservationRetryService = guestActivityReservationRetryService;
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

}