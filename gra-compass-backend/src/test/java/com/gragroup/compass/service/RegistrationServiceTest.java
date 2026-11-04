package com.gragroup.compass.service;

import com.gragroup.compass.model.Registration;
import com.gragroup.compass.repository.RegistrationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RegistrationServiceTest {

    private RegistrationRepository registrationRepository;
    private RegistrationService registrationService;

    @BeforeEach
    void setUp() {
        registrationRepository = Mockito.mock(RegistrationRepository.class);
        registrationService = new RegistrationService(registrationRepository);
    }

    @Test
    void updatesRegistrationWithoutChangingIdentityFields() {
        Registration existingRegistration = new Registration();
        existingRegistration.setId("registration123");
        existingRegistration.setTripId("trip123");
        existingRegistration.setTravelerNumber(1047);
        existingRegistration.setFirstName("Robert");
        existingRegistration.setLastName("Henderson");
        existingRegistration.setEmail("old@example.com");

        Registration updatedRegistration = new Registration();
        updatedRegistration.setId("differentRegistration");
        updatedRegistration.setTripId("differentTrip");
        updatedRegistration.setTravelerNumber(9999);
        updatedRegistration.setFirstName("Bob");
        updatedRegistration.setLastName("Henderson");
        updatedRegistration.setEmail("bob@example.com");

        when(registrationRepository.findByTripIdAndTravelerNumber(
                "trip123", 1047))
                .thenReturn(Optional.of(existingRegistration));

        when(registrationRepository.save(existingRegistration))
                .thenReturn(existingRegistration);

        Optional<Registration> result = registrationService.updateRegistration(
                "trip123",
                1047,
                updatedRegistration);

        assertTrue(result.isPresent());

        Registration savedRegistration = result.get();

        assertEquals("registration123", savedRegistration.getId());
        assertEquals("trip123", savedRegistration.getTripId());
        assertEquals(1047, savedRegistration.getTravelerNumber());

        assertEquals("Bob", savedRegistration.getFirstName());
        assertEquals("Henderson", savedRegistration.getLastName());
        assertEquals("bob@example.com", savedRegistration.getEmail());

        verify(registrationRepository)
                .findByTripIdAndTravelerNumber("trip123", 1047);

        verify(registrationRepository).save(existingRegistration);
    }
}