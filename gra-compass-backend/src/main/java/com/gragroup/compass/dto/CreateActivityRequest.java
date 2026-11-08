package com.gragroup.compass.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
@NoArgsConstructor
public class CreateActivityRequest {

    @NotBlank(message = "Activity type is required")
    private String type;

    @NotBlank(message = "Activity name is required")
    private String name;
}