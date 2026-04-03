package org.messages;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;


public class MessageBytes {
    private static final ObjectMapper mapper = new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public static byte[] toBytes(Message message) {
        try {
            byte[] bytes = mapper.writeValueAsBytes(message);
            return bytes;
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
