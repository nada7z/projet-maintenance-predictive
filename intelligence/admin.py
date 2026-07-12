from django.contrib import admin
from .models import SensorData

@admin.register(SensorData)
class SensorDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'machine', 'timestamp', 'temperature', 'vibration', 'operating_hours', 'consumption', 'failure')
    list_filter = ('failure', 'machine')
    search_fields = ('machine__name', 'machine__serial_number')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)
    date_hierarchy = 'timestamp'