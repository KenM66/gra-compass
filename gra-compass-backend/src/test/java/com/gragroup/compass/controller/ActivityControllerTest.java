package com.gragroup.compass.controller;

import com.gragroup.compass.model.Activity;
import com.gragroup.compass.service.ActivityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

import com.gragroup.compass.dto.CreateActivityRequest;
import com.gragroup.compass.dto.CreateActivitySessionRequest;
import com.gragroup.compass.model.ActivitySession;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.http.MediaType;

@WebMvcTest(ActivityController.class)
class ActivityControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private ActivityService activityService;

        @Test
        void getsActivitiesForExistingTrip() throws Exception {
                Activity excursion = new Activity();
                excursion.setId("activity123");
                excursion.setTripId("trip123");
                excursion.setType("Excursion");
                excursion.setName("Catamaran & Snorkeling");

                Activity spa = new Activity();
                spa.setId("activity456");
                spa.setTripId("trip123");
                spa.setType("Spa");
                spa.setName("Massage Appointment");

                when(activityService.getActivitiesByTripId("trip123"))
                                .thenReturn(List.of(excursion, spa));

                mockMvc.perform(get("/api/trips/trip123/activities"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].id").value("activity123"))
                                .andExpect(jsonPath("$[0].type").value("Excursion"))
                                .andExpect(jsonPath("$[0].name").value("Catamaran & Snorkeling"))
                                .andExpect(jsonPath("$[1].id").value("activity456"))
                                .andExpect(jsonPath("$[1].type").value("Spa"))
                                .andExpect(jsonPath("$[1].name").value("Massage Appointment"));
        }

        @Test
        void returnsNotFoundWhenTripDoesNotExist() throws Exception {
                String tripId = "missingTrip";

                when(activityService.getActivitiesByTripId(tripId))
                                .thenThrow(new NoSuchElementException(
                                                "Trip not found: " + tripId));

                mockMvc.perform(get("/api/trips/missingTrip/activities"))
                                .andExpect(status().isNotFound());
        }

        @Test
        void createsActivityForExistingTrip() throws Exception {
                Activity createdActivity = new Activity();
                createdActivity.setId("activity789");
                createdActivity.setTripId("trip123");
                createdActivity.setType("Excursion");
                createdActivity.setName("Catamaran & Snorkeling");

                when(activityService.createActivity(
                                org.mockito.ArgumentMatchers.eq("trip123"),
                                any(CreateActivityRequest.class)))
                                .thenReturn(createdActivity);

                mockMvc.perform(post("/api/trips/trip123/activities")
                                .contentType("application/json")
                                .content("""
                                                {
                                                    "type": "Excursion",
                                                    "name": "Catamaran & Snorkeling"
                                                }
                                                """))
                                .andExpect(status().isCreated())
                                .andExpect(header().string(
                                                "Location",
                                                "/api/trips/trip123/activities/activity789"))
                                .andExpect(jsonPath("$.id").value("activity789"))
                                .andExpect(jsonPath("$.tripId").value("trip123"))
                                .andExpect(jsonPath("$.type").value("Excursion"))
                                .andExpect(jsonPath("$.name").value("Catamaran & Snorkeling"));
        }

        @Test
        void returnsNotFoundWhenCreatingActivityForMissingTrip() throws Exception {
                String tripId = "missingTrip";

                when(activityService.createActivity(
                                org.mockito.ArgumentMatchers.eq(tripId),
                                any(CreateActivityRequest.class)))
                                .thenThrow(new NoSuchElementException(
                                                "Trip not found: " + tripId));

                mockMvc.perform(post("/api/trips/missingTrip/activities")
                                .contentType("application/json")
                                .content("""
                                                {
                                                    "type": "Excursion",
                                                    "name": "Catamaran & Snorkeling"
                                                }
                                                """))
                                .andExpect(status().isNotFound());
        }

        @Test
        void rejectsActivityWithMissingRequiredFields() throws Exception {
                mockMvc.perform(post("/api/trips/trip123/activities")
                                .contentType("application/json")
                                .content("""
                                                {
                                                    "type": "",
                                                    "name": "   "
                                                }
                                                """))
                                .andExpect(status().isBadRequest());

                org.mockito.Mockito.verify(
                                activityService,
                                org.mockito.Mockito.never())
                                .createActivity(
                                                org.mockito.ArgumentMatchers.anyString(),
                                                any(CreateActivityRequest.class));
        }

        @Test
        void createsSessionForExistingActivity() throws Exception {
                String tripId = "trip123";
                String activityId = "activity456";

                ActivitySession session = new ActivitySession();
                session.setId(101);
                session.setDate(LocalDate.of(2027, 3, 9));
                session.setTime(LocalTime.of(10, 0));
                session.setMaxCapacity(25);
                session.setActive(true);

                when(activityService.createActivitySession(
                                eq(tripId),
                                eq(activityId),
                                any(CreateActivitySessionRequest.class))).thenReturn(session);

                mockMvc.perform(post(
                                "/api/trips/{tripId}/activities/{activityId}/sessions",
                                tripId, activityId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                    "date": "2027-03-09",
                                                    "time": "10:00",
                                                    "maxCapacity": 25
                                                }
                                                """))
                                .andExpect(status().isCreated())
                                .andExpect(header().string(
                                                "Location",
                                                "/api/trips/trip123/activities/activity456/sessions/101"))
                                .andExpect(jsonPath("$.id").value(101))
                                .andExpect(jsonPath("$.date").value("2027-03-09"))
                                .andExpect(jsonPath("$.time").value("10:00:00"))
                                .andExpect(jsonPath("$.maxCapacity").value(25))
                                .andExpect(jsonPath("$.active").value(true));

                verify(activityService).createActivitySession(
                                eq(tripId),
                                eq(activityId),
                                any(CreateActivitySessionRequest.class));
        }

        @Test
        void returnsNotFoundWhenCreatingSessionForMissingActivity()
                        throws Exception {

                String tripId = "trip123";
                String activityId = "missingActivity";

                when(activityService.createActivitySession(
                                eq(tripId),
                                eq(activityId),
                                any(CreateActivitySessionRequest.class))).thenThrow(new NoSuchElementException(
                                                "Activity not found: missingActivity"));

                mockMvc.perform(post(
                                "/api/trips/{tripId}/activities/{activityId}/sessions",
                                tripId, activityId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                    "date": "2027-03-09",
                                                    "time": "10:00",
                                                    "maxCapacity": 25
                                                }
                                                """))
                                .andExpect(status().isNotFound());

                verify(activityService).createActivitySession(
                                eq(tripId),
                                eq(activityId),
                                any(CreateActivitySessionRequest.class));
        }

        @Test
        void rejectsSessionWithInvalidRequiredFields() throws Exception {
                String tripId = "trip123";
                String activityId = "activity456";

                mockMvc.perform(post(
                                "/api/trips/{tripId}/activities/{activityId}/sessions",
                                tripId, activityId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                    "maxCapacity": 0
                                                }
                                                """))
                                .andExpect(status().isBadRequest());

                verify(activityService, never()).createActivitySession(
                                anyString(),
                                anyString(),
                                any(CreateActivitySessionRequest.class));
        }
}