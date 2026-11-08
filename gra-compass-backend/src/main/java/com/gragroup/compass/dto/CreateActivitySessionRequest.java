package com.gragroup.compass.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
public class CreateActivitySessionRequest {

    @NotNull(message = "Session date is required")
    private LocalDate date;

    @NotNull(message = "Session time is required")
    private LocalTime time;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int maxCapacity;
}