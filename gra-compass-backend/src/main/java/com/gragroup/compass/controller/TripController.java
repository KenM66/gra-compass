
package com.gragroup.compass.controller;

import com.gragroup.compass.model.Trip;
import com.gragroup.compass.service.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip) {
        Trip createdTrip = tripService.createTrip(trip);

        return ResponseEntity.status(201).body(createdTrip);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(
            @PathVariable String id,
            @RequestBody Trip trip) {

        if (tripService.getTripById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        trip.setId(id);

        return ResponseEntity.ok(tripService.saveTrip(trip));
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