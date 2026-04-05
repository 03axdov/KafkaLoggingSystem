from confluent_kafka import Consumer, Message
from consumers.KafkaConsumerService import KafkaConsumerService
from consumers.message_processing import processErrorCounts, processErrorLogs
from db.connection import create_connection
from db.repositories.LogsRepository import LogsRepository
from db.repositories.ErrorLogsRepository import ErrorLogsRepository


if __name__ == "__main__":
    db_connector = create_connection()

    error_repository = ErrorLogsRepository(db_connector)

    config = {
        "bootstrap.servers": "localhost:9092",
        "group.id": "python-backend-service",
        "auto.offset.reset": "earliest"
    }
    
    logs_consumer: KafkaConsumerService = KafkaConsumerService(
        ["error-logs"], 
        config, 
        lambda msg: processErrorLogs(msg, error_repository)
    )

    try:
        logs_consumer.start()
    except KeyboardInterrupt:
        logs_consumer.running = False