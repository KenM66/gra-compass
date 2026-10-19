
package com.gragroup.compass.controller;

import com.gragroup.compass.model.Trip;
import com.gragroup.compass.service.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gragroup.compass.dto.CreateTripRequest;
import com.gragroup.compass.dto.UpdateTripRequest;
import com.gragroup.compass.dto.TripResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.net.URI;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    public List<TripResponse> getAllTrips() {
        return tripService.getAllTrips()
                .stream()
                .map(TripResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable String id) {
        return tripService.getTripById(id)
                .map(TripResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(
            @Valid @RequestBody CreateTripRequest request) {

        Trip createdTrip = tripService.createTrip(request);

        URI location = URI.create("/api/trips/" + createdTrip.getId());

        return ResponseEntity.created(location)
                .body(TripResponse.from(createdTrip));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripResponse> updateTrip(
            @PathVariable String id,
            @Valid @RequestBody UpdateTripRequest request) {

        return tripService.getTripById(id)
                .map(existingTrip -> TripResponse.from(
                        tripService.updateTrip(existingTrip, request)))
                .map(ResponseEntity::ok)
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