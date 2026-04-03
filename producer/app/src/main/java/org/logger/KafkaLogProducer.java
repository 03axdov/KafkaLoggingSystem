package org.logger;

import org.messages.Message;
import org.messages.MessageBytes;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;

import java.util.Properties;

public class KafkaLogProducer implements AutoCloseable {
    private final KafkaProducer<String, byte[]> producer;
    private final String topic;

    public KafkaLogProducer(Properties props, String topic) {
        this.producer = new KafkaProducer<String, byte[]>(props);
        this.topic = topic;
    }

    public void sendMessage(Message message) {
        byte[] bytes = MessageBytes.toBytes(message);
        producer.send(new ProducerRecord<String,byte[]>(topic, bytes));
    }

    @Override
    public void close() {
        producer.close();
    }
}