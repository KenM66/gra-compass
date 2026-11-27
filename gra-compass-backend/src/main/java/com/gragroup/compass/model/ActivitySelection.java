package com.gragroup.compass.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ActivitySelection {

    @JsonAlias("id")
    private String activityId;

    private String type;
    private String name;
    private int sessionId;
}