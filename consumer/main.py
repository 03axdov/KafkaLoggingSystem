from confluent_kafka import Consumer

TOPIC = "error-logs"

if __name__ == "__main__":
    
    config = {
        "bootstrap.servers": "localhost:9092",
        "group.id": "error-logs",
        "auto.offset.reset": "earliest"
    }

    consumer = Consumer(config)
    consumer.subscribe(topics=[TOPIC])

    print(f"LISTENING TO {config["group.id"]} AT {config["bootstrap.servers"]}")
    try:
        while True:
            message = consumer.poll(1)

            if not message:
                continue

            if message.error():
                print(message.error())
                continue
            else:
                print(f"Consumed event from topic {message.topic()}: (key = {message.key()}, value = {message.value().decode("utf-8")})")

    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()