package org.streaming;

import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.Produced;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;

import org.messages.LogMessage;
import org.messages.LogMessageSerde;

public final class ErrorFilteringStream {

    public static void build(StreamsBuilder builder, String inputTopic, String outputTopic) {
        KStream<String, LogMessage> messages = builder.stream(
            inputTopic,
            Consumed.with(Serdes.String(), new LogMessageSerde())
        );

        messages
            .filter((key, msg) -> msg != null && "ERROR".equals(msg.level()))
            .to(outputTopic, Produced.with(Serdes.String(), new LogMessageSerde()));

    }

    private ErrorFilteringStream(){}

}
