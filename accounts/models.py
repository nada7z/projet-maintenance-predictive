from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Administrateur'),
        ('supervisor', 'Responsable maintenance'),
        ('tech', 'Technicien'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='tech')

    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name} ({self.get_role_display()})"
        return f"{self.username} ({self.get_role_display()})"