package com.gragroup.compass.service;

import com.gragroup.compass.model.Registration;
import com.gragroup.compass.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;

    public RegistrationService(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    public List<Registration> getRegistrationsByTripId(String tripId) {
        return registrationRepository.findByTripId(tripId);
    }

    public Optional<Registration> getRegistrationByTravelerNumber(
            String tripId,
            int travelerNumber) {
        return registrationRepository.findByTripIdAndTravelerNumber(
                tripId,
                travelerNumber);
    }
}