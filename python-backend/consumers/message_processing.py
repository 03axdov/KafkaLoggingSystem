from confluent_kafka import Message
from db.repositories import ErrorLogsRepository
from db.repositories import LogsRepository
from db.models import LogEvent
import json

def processErrorLogs(message: Message, error_logs_repo: LogsRepository):
    key_bytes = message.key()
    value_bytes = message.value()

    key = key_bytes.decode("utf-8") if key_bytes is not None else None
    value = value_bytes.decode("utf-8") if value_bytes is not None else None

    if value:
        json = json.loads(value)
        print(f"JSON: {json}")
        log_event: LogEvent = LogEvent(
            json["timestamp"],
            json["status"],
            json["message"],
            json["level"],
            json["service"]
        )
        print(f"LogEvent: {log_event}")
        error_logs_repo.insert(log_event)

    print(
        f"Consumed event from topic {message.topic()}: "
        f"(key = {key}, value = {value})"
    )


def processErrorCounts(message: Message):
    key_bytes = message.key()
    value_bytes = message.value()

    key = key_bytes.decode("utf-8") if key_bytes is not None else None
    value = int.from_bytes(value_bytes, byteorder="big", signed=True) if value_bytes is not None else None

    print(
        f"Consumed event from topic {message.topic()}: "
        f"(key = {key}, value = {value})"
    )