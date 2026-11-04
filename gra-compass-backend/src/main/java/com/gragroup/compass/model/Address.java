package com.gragroup.compass.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor

class Address {

    private String street;
    private String city;
    private String state;
    private String zipCode;

}
