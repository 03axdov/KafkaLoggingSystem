package org.streaming;

import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.Produced;
import org.apache.kafka.streams.kstream.KStream;

import java.util.Map;

import org.apache.kafka.common.serialization.Serde;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;

import org.messages.LogMessage;

import io.confluent.kafka.streams.serdes.avro.SpecificAvroSerde;

public final class ErrorFilteringStream {

    public static void build(StreamsBuilder builder, String inputTopic, String outputTopic) {
        Serde<org.schema.avro.Message> messageSerde = new SpecificAvroSerde<>();
        messageSerde.configure(
            Map.of("schema.registry.url", "http://localhost:8081"),
            false // false = value serde, true = key serde
        );

        KStream<String, org.schema.avro.Message> messages = builder.stream(
            inputTopic,
            Consumed.with(Serdes.String(), messageSerde)
        );

        messages
            .filter((key, msg) -> msg != null && ("ERROR".equals(msg.getLevel().toString()) || "ERROR_FIXED".equals(msg.getLevel().toString())))
            .to(outputTopic, Produced.with(Serdes.String(), messageSerde));

    }

    private ErrorFilteringStream(){}

}
