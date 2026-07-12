from django.contrib import admin
from .models import Equipment

@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'model', 'serial_number', 'status', 'criticality', 'created_at')
    list_filter = ('status', 'criticality')
    search_fields = ('name', 'model', 'serial_number')
    readonly_fields = ('qr_code', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'model', 'serial_number', 'location')
        }),
        ('État et criticité', {
            'fields': ('status', 'criticality')
        }),
        ('QR Code', {
            'fields': ('qr_code',),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )