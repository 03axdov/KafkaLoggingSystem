from confluent_kafka import Consumer

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

    try:
        while True:
            message = consumer.poll(1.0)

            if message is None:
                continue

            if message.error():
                print(message.error())
                continue

            key_bytes = message.key()
            value_bytes = message.value()

            key = key_bytes.decode("utf-8") if key_bytes is not None else None
            value = int.from_bytes(value_bytes, byteorder="big", signed=True) if value_bytes is not None else None

            print(
                f"Consumed event from topic {message.topic()}: "
                f"(key = {key}, value = {value})"
            )

    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()