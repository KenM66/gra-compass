package com.gragroup.compass.service;

import com.gragroup.compass.model.Registration;
import com.mongodb.MongoException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GuestActivityReservationRetryServiceTest {

        private static final String TRIP_ID = "test-trip";
        private static final int TRAVELER_NUMBER = 123;
        private static final String ACTIVITY_ID = "test-activity";
        private static final int SESSION_ID = 1;
        private static final int REPLACEMENT_SESSION_ID = 2;

        @Mock
        private GuestActivityReservationService reservationService;

        @InjectMocks
        private GuestActivityReservationRetryService retryService;

        // =====================================================
        // RESERVATION TESTS
        // =====================================================

        @Test
        void shouldReserveWithoutRetry() {

                Registration expected = new Registration();

                when(reservationService.reserveGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                                .thenReturn(expected);

                Registration actual = retryService.reserveGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                assertSame(expected, actual);

                verify(reservationService, times(1))
                                .reserveGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldRetryAfterMongoWriteConflict() {

                Registration expected = new Registration();

                when(reservationService.reserveGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                                .thenThrow(createWriteConflict())
                                .thenReturn(expected);

                Registration actual = retryService.reserveGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                assertSame(expected, actual);

                verify(reservationService, times(2))
                                .reserveGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldNotRetryNonWriteConflict() {

                DataIntegrityViolationException exception = new DataIntegrityViolationException(
                                "Some other database constraint failed");

                when(reservationService.reserveGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                                .thenThrow(exception);

                assertSame(exception, assertThrows(
                                DataIntegrityViolationException.class,
                                () -> retryService.reserveGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

                verify(reservationService, times(1))
                                .reserveGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldStopAfterThreeWriteConflicts() {

                DataIntegrityViolationException exception = createWriteConflict();

                when(reservationService.reserveGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                                .thenThrow(exception);

                assertSame(exception, assertThrows(
                                DataIntegrityViolationException.class,
                                () -> retryService.reserveGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

                verify(reservationService, times(3))
                                .reserveGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldNotRetryWhenSessionIsFull() {

                IllegalStateException exception = new IllegalStateException(
                                "Activity session is full, inactive, or unavailable");

                when(reservationService.reserveGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                                .thenThrow(exception);

                assertSame(exception, assertThrows(
                                IllegalStateException.class,
                                () -> retryService.reserveGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

                verify(reservationService, times(1))
                                .reserveGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        // =====================================================
        // CANCELLATION TESTS
        // =====================================================

        @Test
        void shouldCancelWithoutRetry() {

                Registration expected = new Registration();

                when(reservationService.cancelGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                                .thenReturn(expected);

                Registration actual = retryService.cancelGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                assertSame(expected, actual);

                verify(reservationService, times(1))
                                .cancelGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldRetryCancellationAfterMongoWriteConflict() {

                Registration expected = new Registration();

                when(reservationService.cancelGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                                .thenThrow(createWriteConflict())
                                .thenReturn(expected);

                Registration actual = retryService.cancelGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                assertSame(expected, actual);

                verify(reservationService, times(2))
                                .cancelGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldStopCancellationAfterThreeWriteConflicts() {

                DataIntegrityViolationException exception = createWriteConflict();

                when(reservationService.cancelGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                                .thenThrow(exception);

                assertSame(exception, assertThrows(
                                DataIntegrityViolationException.class,
                                () -> retryService.cancelGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

                verify(reservationService, times(3))
                                .cancelGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldNotRetryCancellationForNonWriteConflict() {

                DataIntegrityViolationException exception = new DataIntegrityViolationException(
                                "Database constraint failed");

                when(reservationService.cancelGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                                .thenThrow(exception);

                assertSame(exception, assertThrows(
                                DataIntegrityViolationException.class,
                                () -> retryService.cancelGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

                verify(reservationService, times(1))
                                .cancelGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldNotRetryCancellationForBusinessException() {

                IllegalStateException exception = new IllegalStateException("Cancellation failed");

                when(reservationService.cancelGuestActivity(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID))
                                .thenThrow(exception);

                assertSame(exception, assertThrows(
                                IllegalStateException.class,
                                () -> retryService.cancelGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID)));

                verify(reservationService, times(1))
                                .cancelGuestActivity(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID, SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        // =====================================================
        // ATOMIC SESSION SWITCHING TESTS
        // =====================================================

        @Test
        void shouldSwitchSessionWithoutRetry() {

                Registration expected = new Registration();

                when(reservationService.switchGuestActivitySession(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                SESSION_ID, REPLACEMENT_SESSION_ID))
                                .thenReturn(expected);

                Registration actual = retryService.switchGuestActivitySession(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                SESSION_ID, REPLACEMENT_SESSION_ID);

                assertSame(expected, actual);

                verify(reservationService, times(1))
                                .switchGuestActivitySession(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                                SESSION_ID, REPLACEMENT_SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldRetrySessionSwitchAfterMongoWriteConflict() {

                Registration expected = new Registration();

                when(reservationService.switchGuestActivitySession(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                SESSION_ID, REPLACEMENT_SESSION_ID))
                                .thenThrow(createWriteConflict())
                                .thenReturn(expected);

                Registration actual = retryService.switchGuestActivitySession(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                SESSION_ID, REPLACEMENT_SESSION_ID);

                assertSame(expected, actual);

                verify(reservationService, times(2))
                                .switchGuestActivitySession(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                                SESSION_ID, REPLACEMENT_SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldStopSessionSwitchAfterThreeWriteConflicts() {

                DataIntegrityViolationException exception = createWriteConflict();

                when(reservationService.switchGuestActivitySession(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                SESSION_ID, REPLACEMENT_SESSION_ID))
                                .thenThrow(exception);

                assertSame(exception, assertThrows(
                                DataIntegrityViolationException.class,
                                () -> retryService.switchGuestActivitySession(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                                SESSION_ID, REPLACEMENT_SESSION_ID)));

                verify(reservationService, times(3))
                                .switchGuestActivitySession(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                                SESSION_ID, REPLACEMENT_SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldNotRetrySessionSwitchForNonWriteConflict() {

                DataIntegrityViolationException exception = new DataIntegrityViolationException(
                                "Database constraint failed");

                when(reservationService.switchGuestActivitySession(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                SESSION_ID, REPLACEMENT_SESSION_ID))
                                .thenThrow(exception);

                assertSame(exception, assertThrows(
                                DataIntegrityViolationException.class,
                                () -> retryService.switchGuestActivitySession(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                                SESSION_ID, REPLACEMENT_SESSION_ID)));

                verify(reservationService, times(1))
                                .switchGuestActivitySession(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                                SESSION_ID, REPLACEMENT_SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        @Test
        void shouldNotRetrySessionSwitchWhenReplacementSessionIsFull() {

                IllegalStateException exception = new IllegalStateException(
                                "Activity session is full, inactive, or unavailable");

                when(reservationService.switchGuestActivitySession(
                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                SESSION_ID, REPLACEMENT_SESSION_ID))
                                .thenThrow(exception);

                assertSame(exception, assertThrows(
                                IllegalStateException.class,
                                () -> retryService.switchGuestActivitySession(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                                SESSION_ID, REPLACEMENT_SESSION_ID)));

                verify(reservationService, times(1))
                                .switchGuestActivitySession(
                                                TRIP_ID, TRAVELER_NUMBER, ACTIVITY_ID,
                                                SESSION_ID, REPLACEMENT_SESSION_ID);

                verifyNoMoreInteractions(reservationService);
        }

        // =====================================================
        // TEST HELPERS
        // =====================================================

        private DataIntegrityViolationException createWriteConflict() {

                return new DataIntegrityViolationException(
                                "Activity transaction failed",
                                new MongoException(112, "WriteConflict"));
        }
}