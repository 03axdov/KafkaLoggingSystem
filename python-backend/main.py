from confluent_kafka import Consumer
from consumers.KafkaConsumerService import KafkaConsumerService
from consumers.ConsumerMessageProcessing import processErrorCounts

TOPIC = "error-counts"

if __name__ == "__main__":
    config = {
        "bootstrap.servers": "localhost:9092",
        "group.id": "error-counts-consumer",
        "auto.offset.reset": "earliest"
    }

    consumer = Consumer(config)
    consumer.subscribe([TOPIC])

    print(f"LISTENING TO {TOPIC} AT {config['bootstrap.servers']}")

    errorCountsConsumer = KafkaConsumerService(
        topics=[TOPIC],
        config=config,
        processMessage=processErrorCounts
    )

    try:
        errorCountsConsumer.start()
    except KeyboardInterrupt:
        errorCountsConsumer.running = False