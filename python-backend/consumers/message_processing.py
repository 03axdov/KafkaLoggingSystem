from confluent_kafka import Message
import json
from api.models import LogEvent, ErrorCount
from django.utils import timezone
from django.db import close_old_connections


def processRawLogs(message: Message):
    close_old_connections()

    key_bytes = message.key()
    value_bytes = message.value()

    key = key_bytes.decode("utf-8") if key_bytes is not None else None
    value = value_bytes.decode("utf-8") if value_bytes is not None else None

    if value:
        message_json = json.loads(value)
        LogEvent.objects.create(
            timestamp = message_json["timestamp"],
            status = message_json["status"],
            message = message_json["message"],
            level = message_json["level"],
            service = message_json["service"]
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