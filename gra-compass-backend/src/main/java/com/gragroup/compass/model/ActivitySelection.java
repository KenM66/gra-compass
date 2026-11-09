package com.gragroup.compass.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ActivitySelection {

    @JsonProperty("id")
    private String activityId;

    private String type;
    private String name;
    private int sessionId;
}