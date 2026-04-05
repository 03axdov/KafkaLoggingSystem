from dataclasses import dataclass
from datetime import datetime


@dataclass
class LogEvent:
    id: int
    timestamp: datetime
    status: int
    message: str
    level: str
    service: str

@dataclass
class ErrorCount:
    id: int
    service: str
    count: int