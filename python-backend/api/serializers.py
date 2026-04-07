from rest_framework import serializers
from .models import LogEvent, ErrorCount

class LogEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogEvent
        fields = "__all__"


class ErrorCountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ErrorCount
        fields = "__all__"