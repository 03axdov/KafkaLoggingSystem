package org.logger;

import org.messages.Message;
import org.messages.MessageAvro;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;

import java.util.Properties;

public class KafkaLogProducer implements AutoCloseable {
    private final KafkaProducer<String, org.schema.avro.Message> producer;
    private final String topic;

    public KafkaLogProducer(Properties props, String topic) {
        this.producer = new KafkaProducer<String, org.schema.avro.Message>(props);
        this.topic = topic;
    }

    public void sendMessage(Message message) {
        producer.send(new ProducerRecord<String, org.schema.avro.Message>(topic, MessageAvro.toAvro(message)));
    }

    @Override
    public void close() {
        producer.close();
    }
}