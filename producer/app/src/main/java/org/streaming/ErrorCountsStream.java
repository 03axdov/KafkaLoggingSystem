package org.streaming;

import java.util.Map;

import org.apache.kafka.common.serialization.Serde;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.Grouped;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.KTable;
import org.apache.kafka.streams.kstream.Materialized;
import org.apache.kafka.streams.kstream.Produced;

import io.confluent.kafka.streams.serdes.avro.SpecificAvroSerde;

public final class ErrorCountsStream {
    public static void build(StreamsBuilder builder, String inputTopic, String outputTopic) {
        Serde<org.schema.avro.Message> messageSerde = new SpecificAvroSerde<>();
        messageSerde.configure(
            Map.of("schema.registry.url", System.getenv("SCHEMA_REGISTRY_URL")),
            false
        );

        KStream<String, org.schema.avro.Message> messages = builder.stream(
            inputTopic,
            Consumed.with(Serdes.String(), messageSerde)
        );

        KTable<String, Long> serviceOpenErrorCountsTable = messages
            .filter((key, msg) ->
                msg != null &&
                msg.getService() != null &&
                msg.getLevel() != null &&
                ("ERROR".contentEquals(msg.getLevel()) || "ERROR_FIXED".contentEquals(msg.getLevel()))
            )
            .groupBy((key, msg) -> msg.getService().toString(),
                Grouped.with(Serdes.String(), messageSerde))
            .aggregate(
                () -> 0L,
                (service, msg, currentCount) -> {
                    if ("ERROR".contentEquals(msg.getLevel())) {
                        return currentCount + 1;
                    } else if ("ERROR_FIXED".contentEquals(msg.getLevel())) {
                        return Math.max(0L, currentCount - 1);
                    }
                    return currentCount;
                },
                Materialized.with(Serdes.String(), Serdes.Long())
            );

        KStream<String, Long> serviceOpenErrorCountsStream = serviceOpenErrorCountsTable.toStream();
        serviceOpenErrorCountsStream.to(outputTopic, Produced.with(Serdes.String(), Serdes.Long()));
    }
}
