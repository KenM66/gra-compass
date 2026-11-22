package com.gragroup.compass.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gragroup.compass.model.Registration;
import com.mongodb.MongoException;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GuestActivityReservationRetryServiceTest {

    @Mock
    private GuestActivityReservationService reservationService;

    @InjectMocks
    private GuestActivityReservationRetryService retryService;

    @Test
    void shouldRetryAfterMongoWriteConflict() {

        String tripId = "test-trip";
        int travelerNumber = 123;
        String activityId = "test-activity";
        int sessionId = 1;

        Registration expected = new Registration();

        MongoException mongoException = new MongoException(112, "WriteConflict");

        DataIntegrityViolationException wrappedException = new DataIntegrityViolationException(
                "Reservation transaction failed", mongoException);

        when(reservationService.reserveGuestActivity(
                tripId, travelerNumber, activityId, sessionId))
                .thenThrow(wrappedException)
                .thenReturn(expected);

        Registration actual = retryService.reserveGuestActivity(
                tripId, travelerNumber, activityId, sessionId);

        assertSame(expected, actual);

        verify(reservationService, times(2))
                .reserveGuestActivity(
                        tripId, travelerNumber, activityId, sessionId);
    }

    @Test
    void shouldNotRetryNonWriteConflict() {

        String tripId = "test-trip";
        int travelerNumber = 123;
        String activityId = "test-activity";
        int sessionId = 1;

        DataIntegrityViolationException exception = new DataIntegrityViolationException(
                "Some other database constraint failed");

        when(reservationService.reserveGuestActivity(
                tripId, travelerNumber, activityId, sessionId))
                .thenThrow(exception);

        assertThrows(
                DataIntegrityViolationException.class,
                () -> retryService.reserveGuestActivity(
                        tripId, travelerNumber, activityId, sessionId));

        verify(reservationService, times(1))
                .reserveGuestActivity(
                        tripId, travelerNumber, activityId, sessionId);
    }

    @Test
    void shouldStopAfterThreeWriteConflicts() {

        String tripId = "test-trip";
        int travelerNumber = 123;
        String activityId = "test-activity";
        int sessionId = 1;

        MongoException mongoException = new MongoException(112, "WriteConflict");

        DataIntegrityViolationException exception = new DataIntegrityViolationException(
                "Reservation transaction failed", mongoException);

        when(reservationService.reserveGuestActivity(
                tripId, travelerNumber, activityId, sessionId))
                .thenThrow(exception);

        assertThrows(
                DataIntegrityViolationException.class,
                () -> retryService.reserveGuestActivity(
                        tripId, travelerNumber, activityId, sessionId));

        verify(reservationService, times(3))
                .reserveGuestActivity(
                        tripId, travelerNumber, activityId, sessionId);
    }

}