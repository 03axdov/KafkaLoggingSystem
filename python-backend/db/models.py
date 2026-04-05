from dataclasses import dataclass
from datetime import datetime


@dataclass
class LogEvent:
    timestamp: datetime
    status: int
    message: str
    level: str
    service: str

@dataclass
class ErrorCount:
    service: str
    count: int