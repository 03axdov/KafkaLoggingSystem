package org.streaming;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.KTable;
import org.apache.kafka.streams.kstream.Produced;
import org.messages.LogMessage;
import org.messages.LogMessageSerde;

public final class ErrorCountsStream {
    public static void build(StreamsBuilder builder, String inputTopic, String outputTopic) {
        KStream<String, LogMessage> messages = builder.stream(
            inputTopic,
            Consumed.with(Serdes.String(), new LogMessageSerde())
        );

        KTable<String, Long> serviceErrorCountsTable = messages
            // inputTopic should already be filtered
            // .filter((key, msg) -> msg != null && "ERROR".equals(msg.level()))
            .groupBy((key, msg) -> msg.service())
            .count();

        KStream<String, Long> serviceErrorCountsStream = serviceErrorCountsTable.toStream();
        serviceErrorCountsStream.to(outputTopic, Produced.with(Serdes.String(), Serdes.Long()));
    }
}
