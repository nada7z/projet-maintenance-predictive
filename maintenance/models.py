from django.db import models
from django.conf import settings
from equipment.models import Equipment

class Intervention(models.Model):
    TYPE_CHOICES = (
        ('corrective', 'Corrective'),
        ('preventive', 'Préventive'),
        ('predictive', 'Prédictive'),
    )
    PRIORITY_CHOICES = (
        ('low', 'Basse'),
        ('medium', 'Moyenne'),
        ('high', 'Haute'),
        ('critical', 'Critique'),
    )
    STATUS_CHOICES = (
        ('planned', 'Planifiée'),
        ('in_progress', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    )

    machine = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='interventions')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_interventions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    planned_start = models.DateTimeField()
    planned_end = models.DateTimeField()
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    description = models.TextField()
    report = models.TextField(blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    downtime_minutes = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_type_display()} - {self.machine.name} ({self.get_status_display()})"

class PreventiveSchedule(models.Model):
    machine = models.OneToOneField(Equipment, on_delete=models.CASCADE, related_name='preventive_schedule')
    frequency_days = models.PositiveIntegerField()
    last_execution = models.DateTimeField(null=True, blank=True)
    next_due = models.DateTimeField()

    def __str__(self):
        return f"Schedule {self.machine.name} - due {self.next_due}"

class InterventionComment(models.Model):
    intervention = models.ForeignKey(
        Intervention,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.created_at}"