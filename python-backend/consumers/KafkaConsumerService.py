from typing import List, Callable
from confluent_kafka import Consumer, Message
from threading import Event

class KafkaConsumerService:
    def __init__(
            self, 
            topics: List[str], 
            config: dict[str, any], 
            processMessage: Callable[[Message], None],
            stop_event: Event,
            pollingTime: int = 1
    ):
        self.topics = topics
        self.consumer = Consumer(config)
        self.processMessage = processMessage
        self.stop_event = stop_event
        self.pollingTime = pollingTime

    def start(self):
        self.running = True
        self.consumer.subscribe(self.topics)
        print(f"Consumer subscribed to {self.topics}")

        try:
            while not self.stop_event.is_set():
                msg = self.consumer.poll(self.pollingTime)

                if msg is None: continue

                if msg.error():
                    print(f"Error: {msg.error()}")
                    continue

                self.processMessage(msg)
        finally:
            self.shutdown()

    def shutdown(self):
        self.consumer.close()