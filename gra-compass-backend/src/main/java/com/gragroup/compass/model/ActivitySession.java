package com.gragroup.compass.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
public class ActivitySession {

    private int id;

    private LocalDate date;
    private LocalTime time;

    private int maxCapacity;
    private boolean active;
}