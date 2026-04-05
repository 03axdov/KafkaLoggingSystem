from confluent_kafka import Message

def processErrorLogs(message: Message):
    key_bytes = message.key()
    value_bytes = message.value()

    key = key_bytes.decode("utf-8") if key_bytes is not None else None
    value = value_bytes.decode("utf-8") if value_bytes is not None else None

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