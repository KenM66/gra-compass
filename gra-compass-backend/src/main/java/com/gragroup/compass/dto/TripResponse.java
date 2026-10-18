package com.gragroup.compass.dto;

import com.gragroup.compass.model.Trip;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class TripResponse {

    private String id;

    private String name;
    private String destination;

    private LocalDate startDate;
    private LocalDate endDate;

    private int registrationCount;
    private int registrationCapacity;
    private int travelerCapacity;

    private LocalDate registrationCloseDate;
    private boolean registrationsPaused;

    public static TripResponse from(Trip trip) {
        TripResponse response = new TripResponse();

        response.setId(trip.getId());
        response.setName(trip.getName());
        response.setDestination(trip.getDestination());
        response.setStartDate(trip.getStartDate());
        response.setEndDate(trip.getEndDate());
        response.setRegistrationCount(trip.getRegistrationCount());
        response.setRegistrationCapacity(trip.getRegistrationCapacity());
        response.setTravelerCapacity(trip.getTravelerCapacity());
        response.setRegistrationCloseDate(trip.getRegistrationCloseDate());
        response.setRegistrationsPaused(trip.isRegistrationsPaused());

        return response;
    }
}