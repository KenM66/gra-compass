package com.gragroup.compass.service;

import com.gragroup.compass.model.Trip;
import com.gragroup.compass.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import com.gragroup.compass.dto.CreateTripRequest;
import com.gragroup.compass.dto.UpdateTripRequest;

class TripServiceTest {

    private TripRepository tripRepository;
    private TripService tripService;

    @BeforeEach
    void setUp() {
        tripRepository = Mockito.mock(TripRepository.class);
        tripService = new TripService(tripRepository);
    }

    @Test
    void getsAllTrips() {
        Trip trip = new Trip();
        trip.setName("Cancun Incentive Trip");

        when(tripRepository.findAll()).thenReturn(List.of(trip));

        List<Trip> result = tripService.getAllTrips();

        assertEquals(1, result.size());
        assertEquals("Cancun Incentive Trip", result.getFirst().getName());
        verify(tripRepository).findAll();
    }

    @Test
    void getsTripById() {
        Trip trip = new Trip();
        trip.setId("trip123");
        trip.setName("Alaska Adventure");

        when(tripRepository.findById("trip123")).thenReturn(Optional.of(trip));

        Optional<Trip> result = tripService.getTripById("trip123");

        assertTrue(result.isPresent());
        assertEquals("Alaska Adventure", result.get().getName());
        verify(tripRepository).findById("trip123");
    }

    @Test
    void createsTripWithBackendOwnedDefaults() {
        CreateTripRequest request = new CreateTripRequest();
        request.setName("Cancun Incentive Trip");
        request.setDestination("Cancun, Mexico");
        request.setRegistrationCapacity(250);
        request.setTravelerCapacity(300);

        when(tripRepository.save(any(Trip.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Trip result = tripService.createTrip(request);

        assertNull(result.getId());
        assertEquals("Cancun Incentive Trip", result.getName());
        assertEquals("Cancun, Mexico", result.getDestination());
        assertEquals(250, result.getRegistrationCapacity());
        assertEquals(300, result.getTravelerCapacity());
        assertEquals(0, result.getRegistrationCount());
        assertFalse(result.isRegistrationsPaused());

        verify(tripRepository).save(any(Trip.class));
    }

    @Test
    void updatesTripWithoutChangingBackendOwnedFields() {
        Trip existingTrip = new Trip();
        existingTrip.setId("trip123");
        existingTrip.setName("Old Trip");
        existingTrip.setRegistrationCount(42);
        existingTrip.setRegistrationsPaused(true);

        UpdateTripRequest request = new UpdateTripRequest();
        request.setName("Updated Trip");
        request.setDestination("Orlando, Florida");
        request.setRegistrationCapacity(250);
        request.setTravelerCapacity(300);

        when(tripRepository.save(existingTrip)).thenReturn(existingTrip);

        Trip result = tripService.updateTrip(existingTrip, request);

        assertEquals("trip123", result.getId());
        assertEquals("Updated Trip", result.getName());
        assertEquals("Orlando, Florida", result.getDestination());
        assertEquals(250, result.getRegistrationCapacity());
        assertEquals(300, result.getTravelerCapacity());

        assertEquals(42, result.getRegistrationCount());
        assertTrue(result.isRegistrationsPaused());

        verify(tripRepository).save(existingTrip);
    }

    @Test
    void pausesRegistrations() {
        Trip trip = new Trip();
        trip.setId("trip123");
        trip.setName("Cancun Incentive Trip");
        trip.setRegistrationsPaused(false);

        when(tripRepository.save(trip)).thenReturn(trip);

        Trip result = tripService.pauseRegistrations(trip);

        assertTrue(result.isRegistrationsPaused());
        assertEquals("Cancun Incentive Trip", result.getName());

        verify(tripRepository).save(trip);
    }

    @Test
    void resumesRegistrations() {
        Trip trip = new Trip();
        trip.setId("trip123");
        trip.setName("Cancun Incentive Trip");
        trip.setRegistrationsPaused(true);

        when(tripRepository.save(trip)).thenReturn(trip);

        Trip result = tripService.resumeRegistrations(trip);

        assertFalse(result.isRegistrationsPaused());
        assertEquals("Cancun Incentive Trip", result.getName());

        verify(tripRepository).save(trip);
    }

    @Test
    void deletesTrip() {
        tripService.deleteTrip("trip123");

        verify(tripRepository).deleteById("trip123");
    }
}