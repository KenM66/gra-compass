package com.gragroup.compass.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

import jakarta.validation.constraints.AssertTrue;

@Getter
@Setter
@NoArgsConstructor
public class CreateTripRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String destination;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @Min(0)
    private int registrationCapacity;

    @Min(0)
    private int travelerCapacity;

    private LocalDate registrationCloseDate;

    @AssertTrue(message = "End date cannot be before the start date")
    public boolean isDateRangeValid() {
        if (startDate == null || endDate == null) {
            return true;
        }

        return !endDate.isBefore(startDate);
    }
}