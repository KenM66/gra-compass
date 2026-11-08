package com.gragroup.compass.repository;

import com.gragroup.compass.model.Registration;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends MongoRepository<Registration, String> {

    List<Registration> findByTripId(String tripId);

    long countByTripId(String tripId);

    Optional<Registration> findByTripIdAndTravelerNumber(
            String tripId,
            int travelerNumber);
}