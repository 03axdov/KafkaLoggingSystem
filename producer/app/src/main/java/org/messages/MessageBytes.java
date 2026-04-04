package org.messages;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.IOException;


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

    public static LogMessage fromBytes(byte[] bytes) {
        try {
            LogMessage message = mapper.readValue(bytes, LogMessage.class);
            return message;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
