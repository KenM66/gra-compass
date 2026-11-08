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

    public long countRegistrationsByTripId(String tripId) {
        return registrationRepository.countByTripId(tripId);
    }

    public long countTravelersByTripId(String tripId) {
        return registrationRepository.findByTripId(tripId)
                .stream()
                .mapToLong(registration -> registration.isBringingGuest()
                        && registration.getGuest() != null ? 2 : 1)
                .sum();
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

    public Optional<Registration> updateRegistration(
            String tripId,
            int travelerNumber,
            Registration updatedRegistration) {

        return registrationRepository
                .findByTripIdAndTravelerNumber(tripId, travelerNumber)
                .map(existingRegistration -> {
                    existingRegistration.setFirstName(updatedRegistration.getFirstName());
                    existingRegistration.setLastName(updatedRegistration.getLastName());
                    existingRegistration.setPreferredName(updatedRegistration.getPreferredName());
                    existingRegistration.setEmail(updatedRegistration.getEmail());
                    existingRegistration.setPhone(updatedRegistration.getPhone());
                    existingRegistration.setDateOfBirth(updatedRegistration.getDateOfBirth());

                    existingRegistration.setAddress(updatedRegistration.getAddress());

                    existingRegistration.setTsaPrecheck(updatedRegistration.isTsaPrecheck());
                    existingRegistration.setPassportNumber(updatedRegistration.getPassportNumber());
                    existingRegistration.setPassportExpiration(updatedRegistration.getPassportExpiration());
                    existingRegistration.setAirport(updatedRegistration.getAirport());
                    existingRegistration.setSex(updatedRegistration.getSex());

                    existingRegistration.setBringingGuest(updatedRegistration.isBringingGuest());
                    existingRegistration.setGuest(updatedRegistration.getGuest());

                    existingRegistration.setEmergencyContact(
                            updatedRegistration.getEmergencyContact());

                    existingRegistration.setAccessibility(
                            updatedRegistration.getAccessibility());
                    existingRegistration.setDietaryRequirements(
                            updatedRegistration.getDietaryRequirements());

                    existingRegistration.setActivities(updatedRegistration.getActivities());
                    existingRegistration.setRole(updatedRegistration.getRole());

                    return registrationRepository.save(existingRegistration);
                });
    }

}