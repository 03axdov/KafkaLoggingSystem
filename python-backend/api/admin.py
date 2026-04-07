from django.contrib import admin
from .models import LogEvent, ErrorCount

# Register your models here.
admin.site.register(LogEvent)
admin.site.register(ErrorCount)