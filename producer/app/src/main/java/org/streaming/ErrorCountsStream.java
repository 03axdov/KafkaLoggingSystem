package org.streaming;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.KTable;
import org.apache.kafka.streams.kstream.Materialized;
import org.apache.kafka.streams.kstream.Produced;
import org.messages.LogMessage;
import org.messages.LogMessageSerde;

public final class ErrorCountsStream {
    public static void build(StreamsBuilder builder, String inputTopic, String outputTopic) {
        KStream<String, LogMessage> messages = builder.stream(
            inputTopic,
            Consumed.with(Serdes.String(), new LogMessageSerde())
        );

        KTable<String, Long> serviceOpenErrorCountsTable = messages
            .filter((key, msg) ->
                msg != null &&
                msg.service() != null &&
                msg.level() != null &&
                ("ERROR".equals(msg.level()) || "ERROR_FIXED".equals(msg.level()))
            )
            .groupBy((key, msg) -> msg.service())
            .aggregate(
                () -> 0L,
                (service, msg, currentCount) -> {
                    if ("ERROR".equals(msg.level())) {
                        return currentCount + 1;
                    } else if ("ERROR_FIXED".equals(msg.level())) {
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
