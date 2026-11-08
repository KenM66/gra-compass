package com.gragroup.compass.service;

import com.gragroup.compass.model.SessionIdCounter;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Service
public class SessionIdService {

    private final MongoTemplate mongoTemplate;

    public SessionIdService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public int getNextSessionId() {
        Query query = new Query(where("_id").is("activitySession"));

        Update update = new Update().inc("sequence", 1);

        FindAndModifyOptions options = FindAndModifyOptions.options()
                .returnNew(true)
                .upsert(true);

        SessionIdCounter counter = mongoTemplate.findAndModify(
                query,
                update,
                options,
                SessionIdCounter.class);

        if (counter == null) {
            throw new IllegalStateException(
                    "Unable to generate session ID");
        }

        return counter.getSequence();
    }
}