package org.streaming;

import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.Produced;
import org.apache.kafka.streams.kstream.KStream;

import java.util.Map;

import org.apache.kafka.common.serialization.Serde;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import io.confluent.kafka.streams.serdes.avro.SpecificAvroSerde;

public final class ErrorFilteringStream {

    public static void build(StreamsBuilder builder, String inputTopic, String outputTopic) {
        Serde<org.schema.avro.Message> messageSerde = new SpecificAvroSerde<>();
        messageSerde.configure(
            Map.of("schema.registry.url", System.getenv("SCHEMA_REGISTRY_URL")),
            false // false = value serde, true = key serde
        );

        KStream<String, org.schema.avro.Message> messages = builder.stream(
            inputTopic,
            Consumed.with(Serdes.String(), messageSerde)
        );

        messages.peek((key, msg) -> System.out.println("READ: key=" + key + ", msg=" + msg));

        messages
            .filter((key, msg) -> {
                System.out.println("MESSAGE: " + msg);
                return msg != null && ("ERROR".equals(msg.getLevel().toString()) || "ERROR_FIXED".equals(msg.getLevel().toString()))})
            .to(outputTopic, Produced.with(Serdes.String(), messageSerde));

    }

    private ErrorFilteringStream(){}

}
