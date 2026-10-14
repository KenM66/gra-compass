package com.gragroup.compass.service;

import com.gragroup.compass.model.Trip;
import com.gragroup.compass.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

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
        Trip trip = new Trip();
        trip.setId("frontend-generated-id");
        trip.setName("Cancun Incentive Trip");
        trip.setRegistrationCount(42);
        trip.setRegistrationsPaused(true);

        when(tripRepository.save(trip)).thenReturn(trip);

        Trip result = tripService.createTrip(trip);

        assertNull(result.getId());
        assertEquals(0, result.getRegistrationCount());
        assertFalse(result.isRegistrationsPaused());
        verify(tripRepository).save(trip);
    }

    @Test
    void savesTrip() {
        Trip trip = new Trip();
        trip.setId("trip123");

        when(tripRepository.save(trip)).thenReturn(trip);

        Trip result = tripService.saveTrip(trip);

        assertSame(trip, result);
        verify(tripRepository).save(trip);
    }

    @Test
    void deletesTrip() {
        tripService.deleteTrip("trip123");

        verify(tripRepository).deleteById("trip123");
    }
}