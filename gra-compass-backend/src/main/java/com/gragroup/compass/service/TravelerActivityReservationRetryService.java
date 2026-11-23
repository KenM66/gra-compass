
package com.gragroup.compass.service;

import com.gragroup.compass.model.Registration;
import com.mongodb.MongoException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class TravelerActivityReservationRetryService {

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

        final int maxAttempts = 3;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return reservationService.reserveTravelerActivity(
                        tripId, travelerNumber, activityId, sessionId);

            } catch (DataIntegrityViolationException exception) {

                boolean writeConflict = false;
                Throwable cause = exception;

                while (cause != null) {
                    if (cause instanceof MongoException mongoException
                            && mongoException.getCode() == 112) {
                        writeConflict = true;
                        break;
                    }

                    cause = cause.getCause();
                }

                if (!writeConflict || attempt == maxAttempts) {
                    throw exception;
                }
            }
        }

        throw new IllegalStateException(
                "Traveler reservation retry attempts exhausted");
    }
}
