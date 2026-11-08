package com.gragroup.compass.service;

import com.gragroup.compass.model.SessionIdCounter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SessionIdServiceTest {

    private MongoTemplate mongoTemplate;
    private SessionIdService sessionIdService;

    @BeforeEach
    void setUp() {
        mongoTemplate = mock(MongoTemplate.class);
        sessionIdService = new SessionIdService(mongoTemplate);
    }

    @Test
    void generatesNextSessionId() {
        SessionIdCounter counter = new SessionIdCounter();
        counter.setId("activitySession");
        counter.setSequence(101);

        when(mongoTemplate.findAndModify(
                any(),
                any(),
                any(),
                eq(SessionIdCounter.class)))
                .thenReturn(counter);

        int result = sessionIdService.getNextSessionId();

        assertEquals(101, result);

        verify(mongoTemplate).findAndModify(
                any(),
                any(),
                any(),
                eq(SessionIdCounter.class));
    }

    @Test
    void throwsExceptionWhenCounterCannotBeGenerated() {
        when(mongoTemplate.findAndModify(
                any(),
                any(),
                any(),
                eq(SessionIdCounter.class)))
                .thenReturn(null);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> sessionIdService.getNextSessionId());

        assertEquals(
                "Unable to generate session ID",
                exception.getMessage());

        verify(mongoTemplate).findAndModify(
                any(),
                any(),
                any(),
                eq(SessionIdCounter.class));
    }
}