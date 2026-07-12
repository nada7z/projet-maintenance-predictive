from django.db import models
from django.conf import settings
from equipment.models import Equipment

class Alert(models.Model):
    TYPE_CHOICES = (
        ('preventive', 'Maintenance préventive'),
        ('predictive', 'Risque de panne'),
        ('overdue', 'Intervention en retard'),
    )
    SEVERITY_CHOICES = (
        ('info', 'Info'),
        ('warning', 'Avertissement'),
        ('critical', 'Critique'),
    )

    machine = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='alerts')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='info')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_type_display()} - {self.machine.name} ({self.get_severity_display()})"