from confluent_kafka import Consumer
from consumers.KafkaConsumerService import KafkaConsumerService
from consumers.ConsumerMessageProcessing import processErrorCounts
from db.connection import create_connection


if __name__ == "__main__":
    db_connector = create_connection()