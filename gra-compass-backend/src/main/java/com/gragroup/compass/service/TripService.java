package com.gragroup.compass.service;

import com.gragroup.compass.model.Trip;
import com.gragroup.compass.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TripService {

    private final TripRepository tripRepository;

    public TripService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Optional<Trip> getTripById(String id) {
        return tripRepository.findById(id);
    }

    public Trip createTrip(Trip trip) {
        trip.setId(null);
        trip.setRegistrationCount(0);
        trip.setRegistrationsPaused(false);

        return tripRepository.save(trip);
    }

    public Trip saveTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    public void deleteTrip(String id) {
        tripRepository.deleteById(id);
    }
}