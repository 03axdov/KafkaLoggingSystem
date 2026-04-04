package org.messages;

import java.io.IOException;

import org.apache.kafka.common.serialization.Deserializer;
import org.apache.kafka.common.serialization.Serde;
import org.apache.kafka.common.serialization.Serializer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

public class LogMessageSerde implements Serde<LogMessage> {
    private final static ObjectMapper mapper = new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Override
    public Serializer<LogMessage> serializer() {
        return (topic, data) -> {
            try {
                return mapper.writeValueAsBytes(data);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        };
    }

    @Override
    public Deserializer<LogMessage> deserializer() {
        return (topic, data) -> {
            try {
                return mapper.readValue(data, LogMessage.class);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        };
    }
}
