import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

import threading
from dotenv import load_dotenv
from confluent_kafka import Consumer, Message
from .KafkaConsumerService import KafkaConsumerService
from .message_processing import processErrorCounts, processRawLogs


if __name__ == "__main__":

    load_dotenv()

    stop_event = threading.Event()

    logs_config = {
        "bootstrap.servers": os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        "group.id": "raw-logs-consumer",
        "auto.offset.reset": "earliest"
    }
    error_counts_config = {
        "bootstrap.servers": os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        "group.id": "error-counts-consumer",
        "auto.offset.reset": "earliest"
    }
    
    logs_consumer: KafkaConsumerService = KafkaConsumerService(
        ["raw-logs"], 
        logs_config, 
        processRawLogs,
        stop_event
    )
    error_counts_consumer: KafkaConsumerService = KafkaConsumerService(
        ["error-counts"],
        error_counts_config,
        processErrorCounts,
        stop_event
    )

    logs_thread = threading.Thread(target=logs_consumer.start, args=())
    error_counts_thread = threading.Thread(target=error_counts_consumer.start, args=())

    logs_thread.start()
    error_counts_thread.start()

    try:
        logs_thread.join()
        error_counts_thread.join()
    except KeyboardInterrupt:
        print("Interrupting consumers...")
        stop_event.set()

        logs_thread.join()
        error_counts_thread.join()

        print("Consumers stopped.")