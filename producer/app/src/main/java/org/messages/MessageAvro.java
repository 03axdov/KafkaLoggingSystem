package org.messages;

public class MessageAvro {
    private static final org.schema.avro.Message.Builder builder = org.schema.avro.Message.newBuilder();
    
    public static final org.schema.avro.Message toAvro(Message message) {
        return builder
            .setTimestamp(message.timestamp())
            .setStatus(message.status())
            .setMessage(message.message())
            .setLevel(message.level())
            .setService(message.service())
            .build();
    }

    public static final LogMessage fromAvro(org.schema.avro.Message message) {
        return new LogMessage(
            message.getTimestamp(),
            message.getStatus(),
            message.getMessage().toString(),
            message.getLevel().toString(),
            message.getService().toString()
        );
    }
}
