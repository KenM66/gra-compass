package com.gragroup.compass.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "registrations")
public class Registration {

    @Id
    private String id;

    private String tripId;
    private int travelerNumber;

    private String firstName;
    private String lastName;
    private String preferredName;
    private String email;
    private String phone;
    private String dateOfBirth;

    private Address address;

    private boolean tsaPrecheck;
    private String passportNumber;
    private String passportExpiration;
    private String airport;
    private String sex;

    private boolean bringingGuest;
    private Guest guest;

    private EmergencyContact emergencyContact;

    private String accessibility;
    private String dietaryRequirements;

    private List<ActivitySelection> activities;

    private String role;
}