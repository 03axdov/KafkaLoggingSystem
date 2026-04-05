from psycopg import Connection

class Repository:
    def __init__(self, db_connector: Connection):
        self.db_connector = db_connector