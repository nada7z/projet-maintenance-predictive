from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Equipment
from maintenance.models import PreventiveSchedule
from datetime import datetime, timedelta

@receiver(post_save, sender=Equipment)
def create_preventive_schedule(sender, instance, created, **kwargs):
    if created:
        # Par défaut : tous les 30 jours
        PreventiveSchedule.objects.create(
            machine=instance,
            frequency_days=30,
            next_due=datetime.now() + timedelta(days=30)
        )