package com.gragroup.compass.controller;

import com.gragroup.compass.model.Registration;
import com.gragroup.compass.service.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/trips/{tripId}/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
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

        return registrationService
                .updateRegistration(tripId, travelerNumber, updatedRegistration)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}