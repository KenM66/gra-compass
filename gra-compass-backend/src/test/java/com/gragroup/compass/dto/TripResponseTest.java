package com.gragroup.compass.dto;

import com.gragroup.compass.model.Trip;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class TripResponseTest {

    @Test
    void createsResponseFromTrip() {
        Trip trip = new Trip();
        trip.setId("trip123");
        trip.setName("Cancun Incentive Trip");
        trip.setDestination("Cancun, Mexico");
        trip.setStartDate(LocalDate.of(2027, 3, 8));
        trip.setEndDate(LocalDate.of(2027, 3, 14));
        trip.setRegistrationCount(12);
        trip.setRegistrationCapacity(250);
        trip.setTravelerCapacity(300);
        trip.setRegistrationCloseDate(LocalDate.of(2027, 2, 15));
        trip.setRegistrationsPaused(false);

        TripResponse response = TripResponse.from(trip);

        assertEquals("trip123", response.getId());
        assertEquals("Cancun Incentive Trip", response.getName());
        assertEquals("Cancun, Mexico", response.getDestination());
        assertEquals(LocalDate.of(2027, 3, 8), response.getStartDate());
        assertEquals(LocalDate.of(2027, 3, 14), response.getEndDate());
        assertEquals(12, response.getRegistrationCount());
        assertEquals(250, response.getRegistrationCapacity());
        assertEquals(300, response.getTravelerCapacity());
        assertEquals(
                LocalDate.of(2027, 2, 15),
                response.getRegistrationCloseDate());
        assertFalse(response.isRegistrationsPaused());
    }
}