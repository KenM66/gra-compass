package com.gragroup.compass.service;

import com.gragroup.compass.model.Registration;
import com.mongodb.MongoException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.function.Supplier;

@Service
public class TravelerActivityReservationRetryService {

    private static final int MAX_ATTEMPTS = 3;

    private final TravelerActivityReservationService reservationService;

    public TravelerActivityReservationRetryService(
            TravelerActivityReservationService reservationService) {
        this.reservationService = reservationService;
    }

    public Registration reserveTravelerActivity(
            String tripId,
            int travelerNumber,
            String activityId,
            int sessionId) {

        return executeWithRetry(() -> reservationService.reserveTravelerActivity(
                tripId, travelerNumber, activityId, sessionId));
    }

    public Registration cancelTravelerActivity(
            String tripId,
            int travelerNumber,
            String activityId,
            int sessionId) {

        return executeWithRetry(() -> reservationService.cancelTravelerActivity(
                tripId, travelerNumber, activityId, sessionId));
    }

    private Registration executeWithRetry(
            Supplier<Registration> operation) {

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                return operation.get();

            } catch (DataIntegrityViolationException exception) {

                if (!isWriteConflict(exception)
                        || attempt == MAX_ATTEMPTS) {
                    throw exception;
                }
            }
        }

        throw new IllegalStateException(
                "Traveler activity retry attempts exhausted");
    }

    private boolean isWriteConflict(Throwable exception) {

        Throwable cause = exception;

        while (cause != null) {
            if (cause instanceof MongoException mongoException
                    && mongoException.getCode() == 112) {
                return true;
            }

            cause = cause.getCause();
        }

        return false;
    }
}