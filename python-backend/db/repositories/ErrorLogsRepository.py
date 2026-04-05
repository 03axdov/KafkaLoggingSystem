from ..models import LogEvent

class ErrorLogsRepository:
    def __init__(self, db_connector):
        self.db_connector = db_connector

    def insert(self, log_event: LogEvent):
        pass