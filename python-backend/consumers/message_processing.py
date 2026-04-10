from confluent_kafka import Message
import json
from api.models import LogEvent, ErrorCount
from django.utils import timezone
from django.db import close_old_connections
from datetime import datetime

from confluent_kafka.schema_registry.avro import AvroDeserializer
from confluent_kafka.serialization import SerializationContext, MessageField


def processRawLogs(message: Message, avro_deserializer: AvroDeserializer):
    close_old_connections()

    key_bytes = message.key()
    value_bytes = message.value()

    key = key_bytes.decode("utf-8") if key_bytes is not None else None
    
    value = None
    if value_bytes is not None:
        value = avro_deserializer(
            value_bytes,
            SerializationContext(message.topic(), MessageField.VALUE)
        )

    if value:
        LogEvent.objects.create(
            timestamp = value["timestamp"],
            status = value["status"],
            message = value["message"],
            level = value["level"],
            service = value["service"]
        )

    print(
        f"Consumed event from topic {message.topic()}: "
        f"(key = {key}, value = {value})"
    )
    print('-' * 10)


def processErrorCounts(message: Message):
    close_old_connections()

    key_bytes = message.key()
    value_bytes = message.value()

    service = key_bytes.decode("utf-8") if key_bytes is not None else None
    count = int.from_bytes(value_bytes, byteorder="big", signed=True) if value_bytes is not None else None

    if service is None or count is None:
        return
    
    ErrorCount.objects.create(
        service=service,
        count=count
    )

    print(
        f"Consumed event from topic {message.topic()}: "
        f"(key = {service}, value = {count})"
    )
    print('-' * 10)