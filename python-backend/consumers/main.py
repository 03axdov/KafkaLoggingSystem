import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

import threading
from dotenv import load_dotenv
from confluent_kafka import Consumer, Message
from .KafkaConsumerService import KafkaConsumerService
from .message_processing import processErrorCounts, processRawLogs

from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroDeserializer


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
    
    schema_registry_conf = {
        "url": os.getenv("SCHEMA_REGISTRY_URL")
    }
    schema_registry_client = SchemaRegistryClient(schema_registry_conf)
    
    avro_deserializer = AvroDeserializer(
        schema_registry_client,
        from_dict=lambda obj, ctx: obj
    )
    
    logs_consumer: KafkaConsumerService = KafkaConsumerService(
        ["raw-logs"], 
        logs_config, 
        lambda raw_log: processRawLogs(raw_log, avro_deserializer),
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