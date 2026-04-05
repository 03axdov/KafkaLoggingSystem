from confluent_kafka import Message
from db.repositories.ErrorLogsRepository import ErrorLogsRepository
from db.repositories.LogsRepository import LogsRepository
from db.models import LogEvent
import json

def processErrorLogs(message: Message, error_logs_repo: LogsRepository):
    key_bytes = message.key()
    value_bytes = message.value()

    key = key_bytes.decode("utf-8") if key_bytes is not None else None
    value = value_bytes.decode("utf-8") if value_bytes is not None else None

    if value:
        message_json = json.loads(value)
        log_event: LogEvent = LogEvent(
            message_json["timestamp"],
            message_json["status"],
            message_json["message"],
            message_json["level"],
            message_json["service"]
        )
        error_logs_repo.insert(log_event)

    print(
        f"Consumed event from topic {message.topic()}: "
        f"(key = {key}, value = {value})"
    )
    print('-' * 10)


def processErrorCounts(message: Message):
    key_bytes = message.key()
    value_bytes = message.value()

    key = key_bytes.decode("utf-8") if key_bytes is not None else None
    value = int.from_bytes(value_bytes, byteorder="big", signed=True) if value_bytes is not None else None

    print(
        f"Consumed event from topic {message.topic()}: "
        f"(key = {key}, value = {value})"
    )