package com.gragroup.compass.service;

import com.gragroup.compass.model.Registration;
import com.mongodb.MongoException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.function.Supplier;

@Service
public class GuestActivityReservationRetryService {

    private static final int MAX_ATTEMPTS = 3;

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

        return executeWithRetry(() -> reservationService.reserveGuestActivity(
                tripId,
                travelerNumber,
                activityId,
                sessionId));
    }

    public Registration cancelGuestActivity(
            String tripId,
            int travelerNumber,
            String activityId,
            int sessionId) {

        return executeWithRetry(() -> reservationService.cancelGuestActivity(
                tripId,
                travelerNumber,
                activityId,
                sessionId));
    }

    public Registration switchGuestActivitySession(
            String tripId,
            int travelerNumber,
            String activityId,
            int currentSessionId,
            int newSessionId) {

        return executeWithRetry(() -> reservationService.switchGuestActivitySession(
                tripId,
                travelerNumber,
                activityId,
                currentSessionId,
                newSessionId));
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
                "Reservation retry attempts exhausted");
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