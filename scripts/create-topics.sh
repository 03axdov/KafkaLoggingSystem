#!/bin/bash

echo "Waiting for Kafka to be ready..."

until /opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka:9093 --list
do
  echo "Kafka not ready yet..."
  sleep 2
done

echo "Creating topics..."

/opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka:9093 --create --if-not-exists --topic raw-logs --partitions 3 --replication-factor 1
/opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka:9093 --create --if-not-exists --topic error-logs --partitions 3 --replication-factor 1
/opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka:9093 --create --if-not-exists --topic error-counts --partitions 1 --replication-factor 1

echo "Topics created."