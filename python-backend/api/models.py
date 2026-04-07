from django.db import models

"""
timestamp: datetime
status: int
message: str
level: str
service: str
"""

# Create your models here.
class ErrorLogEvent(models.Model):
    timestamp = models.DateTimeField()
    status = models.PositiveIntegerField()
    message = models.CharField(max_length=512)
    level = models.CharField(max_length=64)
    service = models.CharField(max_length=128)

    def __str__(self):
        return f"[{self.level}] {self.service} ({self.message})"