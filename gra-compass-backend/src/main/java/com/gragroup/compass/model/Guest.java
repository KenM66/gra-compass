package com.gragroup.compass.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class Guest {

    private String firstName;
    private String lastName;
    private String email;

    private String accessibility;
    private String dietaryRequirements;

    private String airport;
    private String dateOfBirth;
    private String sex;

    private String passportNumber;
    private String passportExpiration;
    private boolean tsaPrecheck;

    private List<ActivitySelection> activities;
}