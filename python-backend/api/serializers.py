from rest_framework import serializers
from .models import ErrorLogEvent

class ErrorLogEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ErrorLogEvent
        fields = "__all__"