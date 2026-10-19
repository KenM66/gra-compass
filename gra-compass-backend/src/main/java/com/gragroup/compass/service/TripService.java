package com.gragroup.compass.service;

import com.gragroup.compass.model.Trip;
import com.gragroup.compass.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import com.gragroup.compass.dto.CreateTripRequest;
import com.gragroup.compass.dto.UpdateTripRequest;

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

    public Trip createTrip(CreateTripRequest request) {
        Trip trip = new Trip();

        trip.setName(request.getName());
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setRegistrationCapacity(request.getRegistrationCapacity());
        trip.setTravelerCapacity(request.getTravelerCapacity());
        trip.setRegistrationCloseDate(request.getRegistrationCloseDate());

        trip.setRegistrationCount(0);
        trip.setRegistrationsPaused(false);

        return tripRepository.save(trip);
    }

    public Trip updateTrip(Trip trip, UpdateTripRequest request) {
        trip.setName(request.getName());
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setRegistrationCapacity(request.getRegistrationCapacity());
        trip.setTravelerCapacity(request.getTravelerCapacity());
        trip.setRegistrationCloseDate(request.getRegistrationCloseDate());

        return tripRepository.save(trip);
    }

    public void deleteTrip(String id) {
        tripRepository.deleteById(id);
    }
}