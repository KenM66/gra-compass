package com.gragroup.compass.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "activities")
public class Activity {

    @Id
    private String id;

    private String tripId;

    private String type;
    private String name;

    private List<ActivitySession> sessions = new ArrayList<>();
}