package com.gragroup.compass.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gragroup.compass.model.Registration;
import com.mongodb.MongoException;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TravelerActivityReservationRetryServiceTest {

    private static final String TRIP_ID = "test-trip";
    private static final int TRAVELER_NUMBER = 123;
    private static final String ACTIVITY_ID = "test-activity";
    private static final int SESSION_ID = 1;

    @Mock
    private TravelerActivityReservationService reservationService;

    @InjectMocks
    private TravelerActivityReservationRetryService retryService;

    @Test
    void shouldReserveWithoutRetry() {

        Registration expected = new Registration();

        when(reservationService.reserveTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                .thenReturn(expected);

        Registration actual = retryService.reserveTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

        assertSame(expected, actual);

        verify(reservationService, times(1))
                .reserveTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);
    }

    @Test
    void shouldCancelWithoutRetry() {

        Registration expected = new Registration();

        when(reservationService.cancelTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                .thenReturn(expected);

        Registration actual = retryService.cancelTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

        assertSame(expected, actual);

        verify(reservationService, times(1))
                .cancelTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);
    }

    @Test
    void shouldRetryReservationAfterMongoWriteConflict() {

        Registration expected = new Registration();

        when(reservationService.reserveTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                .thenThrow(createWriteConflict())
                .thenReturn(expected);

        Registration actual = retryService.reserveTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

        assertSame(expected, actual);

        verify(reservationService, times(2))
                .reserveTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);
    }

    @Test
    void shouldRetryCancellationAfterMongoWriteConflict() {

        Registration expected = new Registration();

        when(reservationService.cancelTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                .thenThrow(createWriteConflict())
                .thenReturn(expected);

        Registration actual = retryService.cancelTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

        assertSame(expected, actual);

        verify(reservationService, times(2))
                .cancelTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);
    }

    @Test
    void shouldStopReservationAfterThreeWriteConflicts() {

        DataIntegrityViolationException exception = createWriteConflict();

        when(reservationService.reserveTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                .thenThrow(exception);

        assertSame(exception, assertThrows(
                DataIntegrityViolationException.class,
                () -> retryService.reserveTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

        verify(reservationService, times(3))
                .reserveTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);
    }

    @Test
    void shouldStopCancellationAfterThreeWriteConflicts() {

        DataIntegrityViolationException exception = createWriteConflict();

        when(reservationService.cancelTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                .thenThrow(exception);

        assertSame(exception, assertThrows(
                DataIntegrityViolationException.class,
                () -> retryService.cancelTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

        verify(reservationService, times(3))
                .cancelTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);
    }

    @Test
    void shouldNotRetryReservationForNonWriteConflict() {

        DataIntegrityViolationException exception = new DataIntegrityViolationException(
                "Database constraint failed");

        when(reservationService.reserveTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                .thenThrow(exception);

        assertSame(exception, assertThrows(
                DataIntegrityViolationException.class,
                () -> retryService.reserveTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

        verify(reservationService, times(1))
                .reserveTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);
    }

    @Test
    void shouldNotRetryCancellationForNonWriteConflict() {

        DataIntegrityViolationException exception = new DataIntegrityViolationException(
                "Database constraint failed");

        when(reservationService.cancelTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                .thenThrow(exception);

        assertSame(exception, assertThrows(
                DataIntegrityViolationException.class,
                () -> retryService.cancelTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

        verify(reservationService, times(1))
                .cancelTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);
    }

    @Test
    void shouldNotRetryWhenSessionIsFull() {

        IllegalStateException exception = new IllegalStateException("Activity session is full");

        when(reservationService.reserveTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                .thenThrow(exception);

        assertSame(exception, assertThrows(
                IllegalStateException.class,
                () -> retryService.reserveTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

        verify(reservationService, times(1))
                .reserveTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);
    }

    @Test
    void shouldNotRetryWhenCancellationReservationDoesNotExist() {

        NoSuchElementException exception = new NoSuchElementException(
                "Traveler activity reservation not found");

        when(reservationService.cancelTravelerActivity(
                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                .thenThrow(exception);

        assertSame(exception, assertThrows(
                NoSuchElementException.class,
                () -> retryService.cancelTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

        verify(reservationService, times(1))
                .cancelTravelerActivity(
                        TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);
    }

    private DataIntegrityViolationException createWriteConflict() {

        MongoException mongoException = new MongoException(112, "WriteConflict");

        return new DataIntegrityViolationException(
                "Activity transaction failed", mongoException);
    }
}