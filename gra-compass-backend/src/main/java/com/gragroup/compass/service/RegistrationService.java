package com.gragroup.compass.service;

import com.gragroup.compass.model.Registration;
import com.gragroup.compass.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Objects;
import com.gragroup.compass.model.ActivitySelection;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

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
                    if (!Objects.equals(
                            activitySelectionKeys(existingRegistration.getActivities()),
                            activitySelectionKeys(updatedRegistration.getActivities()))) {

                        throw new IllegalArgumentException(
                                "Activity reservations must be changed through the reservation API");
                    }
                    List<ActivitySelection> existingGuestActivities = existingRegistration.getGuest() == null
                            ? null
                            : existingRegistration.getGuest().getActivities();

                    List<ActivitySelection> updatedGuestActivities = updatedRegistration.getGuest() == null
                            ? null
                            : updatedRegistration.getGuest().getActivities();

                    if (!Objects.equals(
                            activitySelectionKeys(existingGuestActivities),
                            activitySelectionKeys(updatedGuestActivities))) {

                        throw new IllegalArgumentException(
                                "Guest activity reservations must be changed through the reservation API");
                    }
                    if (!updatedRegistration.isBringingGuest()
                            && !activitySelectionKeys(existingGuestActivities).isEmpty()) {

                        throw new IllegalArgumentException(
                                "Cannot remove a guest with activity reservations. "
                                        + "Cancel their reservations first.");
                    }
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
                    if (updatedRegistration.getGuest() != null
                            && existingRegistration.getGuest() != null) {

                        updatedRegistration.getGuest().setActivities(
                                existingRegistration.getGuest().getActivities());
                    }

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

    private Map<String, Integer> activitySelectionKeys(
            List<ActivitySelection> selections) {

        Map<String, Integer> counts = new HashMap<>();

        if (selections == null) {
            return counts;
        }

        for (ActivitySelection selection : selections) {
            if (selection == null) {
                counts.merge("<null-selection>", 1, Integer::sum);
                continue;
            }

            String key = String.valueOf(selection.getActivityId())
                    + "\u0000" + selection.getSessionId()
                    + "\u0000" + String.valueOf(selection.getType())
                    + "\u0000" + String.valueOf(selection.getName());

            counts.merge(key, 1, Integer::sum);
        }

        return counts;
    }

}