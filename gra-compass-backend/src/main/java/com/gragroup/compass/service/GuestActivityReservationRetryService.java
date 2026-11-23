package com.gragroup.compass.service;

import org.springframework.stereotype.Service;
import com.gragroup.compass.model.Registration;
import org.springframework.dao.DataIntegrityViolationException;
import com.mongodb.MongoException;

@Service
public class GuestActivityReservationRetryService {

    private final GuestActivityReservationService reservationService;

    public GuestActivityReservationRetryService(
            GuestActivityReservationService reservationService) {
        this.reservationService = reservationService;
    }

    public Registration reserveGuestActivity(
            String tripId,
            int travelerNumber,
            String activityId,
            int sessionId) {

        final int maxAttempts = 3;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return reservationService.reserveGuestActivity(
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

        throw new IllegalStateException("Reservation retry attempts exhausted");
    }

    public Registration cancelGuestActivity(
            String tripId,
            int travelerNumber,
            String activityId,
            int sessionId) {

        final int maxAttempts = 3;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return reservationService.cancelGuestActivity(
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
                "Cancellation retry attempts exhausted");
    }
}