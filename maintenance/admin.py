from django.contrib import admin
from .models import Intervention, PreventiveSchedule

@admin.register(Intervention)
class InterventionAdmin(admin.ModelAdmin):
    list_display = ('id', 'machine', 'type', 'priority', 'assigned_to', 'status', 'planned_start', 'planned_end')
    list_filter = ('type', 'priority', 'status', 'assigned_to')
    search_fields = ('machine__name', 'description', 'assigned_to__username')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-planned_start',)
    fieldsets = (
        ('Informations générales', {
            'fields': ('machine', 'type', 'priority')
        }),
        ('Planification', {
            'fields': ('planned_start', 'planned_end', 'assigned_to')
        }),
        ('Statut et exécution', {
            'fields': ('status', 'actual_start', 'actual_end', 'downtime_minutes')
        }),
        ('Détails', {
            'fields': ('description', 'report', 'cost')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(PreventiveSchedule)
class PreventiveScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'machine', 'frequency_days', 'last_execution', 'next_due')
    list_filter = ('frequency_days',)
    search_fields = ('machine__name', 'machine__serial_number')
    ordering = ('next_due',)
    readonly_fields = ('last_execution',)