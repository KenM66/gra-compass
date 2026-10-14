
package com.gragroup.compass.controller;

import com.gragroup.compass.model.Trip;
import com.gragroup.compass.service.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gragroup.compass.dto.CreateTripRequest;
import com.gragroup.compass.dto.UpdateTripRequest;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    public List<Trip> getAllTrips() {
        return tripService.getAllTrips();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable String id) {
        return tripService.getTripById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Trip> createTrip(
            @Valid @RequestBody CreateTripRequest request) {

        Trip createdTrip = tripService.createTrip(request);

        return ResponseEntity.status(201).body(createdTrip);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(
            @PathVariable String id,
            @Valid @RequestBody UpdateTripRequest request) {

        return tripService.getTripById(id)
                .map(existingTrip -> ResponseEntity.ok(
                        tripService.updateTrip(existingTrip, request)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable String id) {
        if (tripService.getTripById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        tripService.deleteTrip(id);

        return ResponseEntity.noContent().build();
    }
}