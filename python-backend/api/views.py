from django.shortcuts import render
from rest_framework import viewsets
from .serializers import LogEventSerializer, ErrorCountSerializer
from .models import LogEvent, ErrorCount

# Create your views here.
class LogEventViewSet(viewsets.ModelViewSet):
    queryset = LogEvent.objects.all().order_by("-timestamp")
    serializer_class = LogEventSerializer


class ErrorCountViewSet(viewsets.ModelViewSet):
    queryset = ErrorCount.objects.all().order_by("service")
    serializer_class = ErrorCountSerializer