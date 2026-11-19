
package com.gragroup.compass.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityReservationRollbackTestService {

    private final ActivityReservationService reservationService;

    public ActivityReservationRollbackTestService(
            ActivityReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @Transactional
    public void reserveThenFail(
            String tripId,
            String activityId,
            int sessionId) {
        boolean reserved = reservationService.reserveSeat(
                tripId,
                activityId,
                sessionId);

        if (!reserved) {
            throw new IllegalStateException("Reservation was rejected");
        }

        throw new IllegalStateException(
                "Intentional failure to test transaction rollback");
    }

}
