package org.streaming;

import org.apache.avro.generic.GenericRecord;
import org.apache.kafka.common.serialization.Serde;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;

import java.util.Map;

import io.confluent.kafka.streams.serdes.avro.GenericAvroSerde;

public class DebugStream {
    public static void build(StreamsBuilder builder, String inputTopic, String outputTopic) {
        Serde<GenericRecord> messageSerde = new GenericAvroSerde();

        messageSerde.configure(
            Map.of("schema.registry.url", System.getenv("SCHEMA_REGISTRY_URL")),
            false
        );

        KStream<String, GenericRecord> messages = builder.stream(
            inputTopic,
            Consumed.with(Serdes.String(), messageSerde)
        );

        messages.foreach((key, msg) -> {
            System.out.println("READ: " + msg);
        });
    }
}
