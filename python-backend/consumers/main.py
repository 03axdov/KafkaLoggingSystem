import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from dotenv import load_dotenv
from confluent_kafka import Consumer, Message
from .KafkaConsumerService import KafkaConsumerService
from .message_processing import processErrorCounts, processErrorLogs


if __name__ == "__main__":

    load_dotenv()

    config = {
        "bootstrap.servers": os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        "group.id": "python-backend-service",
        "auto.offset.reset": "earliest"
    }
    
    logs_consumer: KafkaConsumerService = KafkaConsumerService(
        ["error-logs"], 
        config, 
        lambda msg: processErrorLogs(msg)
    )

    try:
        logs_consumer.start()
    except KeyboardInterrupt:
        logs_consumer.running = False