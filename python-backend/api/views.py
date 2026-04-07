from django.shortcuts import render
from rest_framework import viewsets
from .serializers import ErrorLogEventSerializer
from .models import ErrorLogEvent

# Create your views here.
class ErrorLogEventViewSet(viewsets.ModelViewSet):
    queryset = ErrorLogEvent.objects.all().order_by("-timestamp")
    serializer_class = ErrorLogEventSerializer