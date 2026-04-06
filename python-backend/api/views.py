from django.shortcuts import render
from rest_framework import viewsets
from .serializers import LogEventSerializer
from .models import LogEvent

# Create your views here.
class LogEventViewSet(viewsets.ModelViewSet):
    queryset = LogEvent.objects.all().order_by("-timestamp")
    serializer_class = LogEventSerializer