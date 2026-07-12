from django.db import models
from equipment.models import Equipment

class SensorData(models.Model):
    machine = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='sensor_data')
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField()
    vibration = models.FloatField()
    operating_hours = models.FloatField()
    consumption = models.FloatField()
    failure = models.BooleanField(default=False)  # cible pour l'entraînement

    class Meta:
        indexes = [
            models.Index(fields=['machine', '-timestamp']),
        ]
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.machine.name} - {self.timestamp}"