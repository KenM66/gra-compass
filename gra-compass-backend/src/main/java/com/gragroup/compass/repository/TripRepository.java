package com.gragroup.compass.repository;

import com.gragroup.compass.model.Trip;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TripRepository extends MongoRepository<Trip, String> {
}