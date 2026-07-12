from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'type', 'format', 'generated_by', 'generated_at', 'file')
    list_filter = ('type', 'format')
    search_fields = ('title', 'generated_by__username')
    readonly_fields = ('generated_at',)
    ordering = ('-generated_at',)