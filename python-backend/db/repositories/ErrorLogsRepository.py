from ..models import LogEvent
from psycopg import Connection
from .Repository import Repository

class ErrorLogsRepository(Repository):
    def insert(self, log_event: LogEvent):
        with self.db_connector.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO error_logs(timestamp, status, message, level, service)
                VALUES
                    (%s, %s, %s, %s, %s)
                """,
                (
                    log_event.timestamp,
                    log_event.status,
                    log_event.message,
                    log_event.level,
                    log_event.service
                )
            )

        self.db_connector.commit()

        print(f"Inserted {log_event} into the database.")
        print('-' * 10)