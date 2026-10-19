package com.gragroup.compass.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "trips")
public class Trip {

    @Id
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
}