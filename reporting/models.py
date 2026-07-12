from django.db import models
from django.conf import settings

class Report(models.Model):
    TYPE_CHOICES = (
        ('monthly', 'Mensuel'),
        ('annual', 'Annuel'),
        ('custom', 'Personnalisé'),
    )
    FORMAT_CHOICES = (
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
    )

    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='reports/')
    parameters = models.JSONField(default=dict)  # pour stocker les filtres

    def __str__(self):
        return f"{self.title} - {self.generated_at.strftime('%Y-%m-%d')}"