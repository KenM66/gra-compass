package com.gragroup.compass.controller;

import com.gragroup.compass.model.Trip;
import com.gragroup.compass.service.TripService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.Optional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

import com.gragroup.compass.dto.CreateTripRequest;
import com.gragroup.compass.dto.UpdateTripRequest;

@WebMvcTest(TripController.class)
class TripControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private TripService tripService;

        @Test
        void getsAllTrips() throws Exception {
                Trip trip = new Trip();
                trip.setId("trip123");
                trip.setName("Cancun Incentive Trip");
                trip.setDestination("Cancun, Mexico");

                when(tripService.getAllTrips()).thenReturn(List.of(trip));

                mockMvc.perform(get("/api/trips"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].id").value("trip123"))
                                .andExpect(jsonPath("$[0].name").value("Cancun Incentive Trip"))
                                .andExpect(jsonPath("$[0].destination").value("Cancun, Mexico"));
        }

        @Test
        void getsTripById() throws Exception {
                Trip trip = new Trip();
                trip.setId("trip123");
                trip.setName("Alaska Adventure");
                trip.setDestination("Alaska, USA");

                when(tripService.getTripById("trip123"))
                                .thenReturn(Optional.of(trip));

                mockMvc.perform(get("/api/trips/trip123"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value("trip123"))
                                .andExpect(jsonPath("$.name").value("Alaska Adventure"))
                                .andExpect(jsonPath("$.destination").value("Alaska, USA"));
        }

        @Test
        void returnsNotFoundWhenTripDoesNotExist() throws Exception {
                when(tripService.getTripById("missing"))
                                .thenReturn(Optional.empty());

                mockMvc.perform(get("/api/trips/missing"))
                                .andExpect(status().isNotFound());
        }

        @Test
        void createsTrip() throws Exception {
                Trip createdTrip = new Trip();
                createdTrip.setId("trip456");
                createdTrip.setName("Cancun Incentive Trip");
                createdTrip.setDestination("Cancun, Mexico");

                when(tripService.createTrip(
                                org.mockito.ArgumentMatchers.any(CreateTripRequest.class)))
                                .thenReturn(createdTrip);

                mockMvc.perform(post("/api/trips")
                                .contentType("application/json")
                                .content("""
                                                {
                                                  "name": "Cancun Incentive Trip",
                                                  "destination": "Cancun, Mexico",
                                                  "startDate": "2027-03-08",
                                                  "endDate": "2027-03-14"
                                                }
                                                """))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value("trip456"))
                                .andExpect(jsonPath("$.name").value("Cancun Incentive Trip"))
                                .andExpect(jsonPath("$.destination").value("Cancun, Mexico"));
        }

        @Test
        void rejectsCreateTripWithMissingRequiredFields() throws Exception {
                mockMvc.perform(post("/api/trips")
                                .contentType("application/json")
                                .content("""
                                                {
                                                  "name": "",
                                                  "destination": "",
                                                  "registrationCapacity": -1,
                                                  "travelerCapacity": -1
                                                }
                                                """))
                                .andExpect(status().isBadRequest());

                org.mockito.Mockito.verify(
                                tripService,
                                org.mockito.Mockito.never())
                                .createTrip(org.mockito.ArgumentMatchers.any(CreateTripRequest.class));
        }

        @Test
        void updatesTrip() throws Exception {
                Trip existingTrip = new Trip();
                existingTrip.setId("trip123");
                existingTrip.setName("Old Trip Name");

                Trip updatedTrip = new Trip();
                updatedTrip.setId("trip123");
                updatedTrip.setName("Updated Trip Name");
                updatedTrip.setDestination("Orlando, Florida");

                when(tripService.getTripById("trip123"))
                                .thenReturn(Optional.of(existingTrip));

                when(tripService.updateTrip(
                                org.mockito.ArgumentMatchers.any(Trip.class),
                                org.mockito.ArgumentMatchers.any(UpdateTripRequest.class)))
                                .thenReturn(updatedTrip);

                mockMvc.perform(put("/api/trips/trip123")
                                .contentType("application/json")
                                .content("""
                                                {
                                                  "name": "Updated Trip Name",
                                                  "destination": "Orlando, Florida",
                                                  "startDate": "2027-05-10",
                                                  "endDate": "2027-05-15"
                                                }
                                                """))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value("trip123"))
                                .andExpect(jsonPath("$.name").value("Updated Trip Name"))
                                .andExpect(jsonPath("$.destination").value("Orlando, Florida"));
        }

        @Test
        void returnsNotFoundWhenUpdatingMissingTrip() throws Exception {
                when(tripService.getTripById("missing"))
                                .thenReturn(Optional.empty());

                mockMvc.perform(put("/api/trips/missing")
                                .contentType("application/json")
                                .content("""
                                                {
                                                  "name": "Updated Trip Name",
                                                  "destination": "Orlando, Florida",
                                                  "startDate": "2027-05-10",
                                                  "endDate": "2027-05-15"
                                                }
                                                """))
                                .andExpect(status().isNotFound());
        }

        @Test
        void deletesTrip() throws Exception {
                Trip existingTrip = new Trip();
                existingTrip.setId("trip123");

                when(tripService.getTripById("trip123"))
                                .thenReturn(Optional.of(existingTrip));

                mockMvc.perform(delete("/api/trips/trip123"))
                                .andExpect(status().isNoContent());

                org.mockito.Mockito.verify(tripService).deleteTrip("trip123");
        }

        @Test
        void returnsNotFoundWhenDeletingMissingTrip() throws Exception {
                when(tripService.getTripById("missing"))
                                .thenReturn(Optional.empty());

                mockMvc.perform(delete("/api/trips/missing"))
                                .andExpect(status().isNotFound());

                org.mockito.Mockito.verify(tripService, org.mockito.Mockito.never())
                                .deleteTrip("missing");
        }

        @Test
        void rejectsCreateTripWhenEndDateIsBeforeStartDate() throws Exception {
                mockMvc.perform(post("/api/trips")
                                .contentType("application/json")
                                .content("""
                                                {
                                                  "name": "Backwards Trip",
                                                  "destination": "Somewhere",
                                                  "startDate": "2027-03-14",
                                                  "endDate": "2027-03-08",
                                                  "registrationCapacity": 100,
                                                  "travelerCapacity": 100
                                                }
                                                """))
                                .andExpect(status().isBadRequest());

                org.mockito.Mockito.verify(
                                tripService,
                                org.mockito.Mockito.never())
                                .createTrip(org.mockito.ArgumentMatchers.any(CreateTripRequest.class));
        }
}