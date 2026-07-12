from django.contrib import admin
from .models import Alert

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'machine', 'type', 'severity', 'is_read', 'created_at')
    list_filter = ('type', 'severity', 'is_read')
    search_fields = ('machine__name', 'message')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
    actions = ['mark_as_read']

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Marquer les alertes sélectionnées comme lues"