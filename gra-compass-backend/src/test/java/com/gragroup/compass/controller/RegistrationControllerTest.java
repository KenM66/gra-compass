package com.gragroup.compass.controller;

import com.gragroup.compass.model.Registration;
import com.gragroup.compass.service.RegistrationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RegistrationController.class)
class RegistrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegistrationService registrationService;

    @Test
    void updatesRegistration() throws Exception {
        Registration updatedRegistration = new Registration();
        updatedRegistration.setId("registration123");
        updatedRegistration.setTripId("trip123");
        updatedRegistration.setTravelerNumber(1047);
        updatedRegistration.setFirstName("Bob");
        updatedRegistration.setLastName("Henderson");
        updatedRegistration.setEmail("bob@example.com");

        when(registrationService.updateRegistration(
                org.mockito.ArgumentMatchers.eq("trip123"),
                org.mockito.ArgumentMatchers.eq(1047),
                any(Registration.class)))
                .thenReturn(Optional.of(updatedRegistration));

        mockMvc.perform(put("/api/trips/trip123/registrations/1047")
                .contentType("application/json")
                .content("""
                        {
                          "firstName": "Bob",
                          "lastName": "Henderson",
                          "email": "bob@example.com"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("registration123"))
                .andExpect(jsonPath("$.tripId").value("trip123"))
                .andExpect(jsonPath("$.travelerNumber").value(1047))
                .andExpect(jsonPath("$.firstName").value("Bob"))
                .andExpect(jsonPath("$.lastName").value("Henderson"))
                .andExpect(jsonPath("$.email").value("bob@example.com"));
    }
}