from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import PreventiveSchedule
from notifications.models import Alert
from notifications.tasks import send_alert_email

@shared_task
def check_preventive_maintenance():
    """Vérifie toutes les échéances préventives et crée des alertes si une échéance approche (<= 3 jours)."""
    now = timezone.now()
    threshold = now + timedelta(days=3)
    schedules = PreventiveSchedule.objects.filter(next_due__lte=threshold, next_due__gte=now)

    for schedule in schedules:
        machine = schedule.machine
        Alert.objects.create(
            machine=machine,
            type='preventive',
            severity='warning',
            message=f"Maintenance préventive due le {schedule.next_due.strftime('%d/%m/%Y')}"
        )
        send_alert_email.delay(
            subject=f"Maintenance préventive - {machine.name}",
            message=f"La maintenance préventive de {machine.name} est prévue pour le {schedule.next_due}.",
            recipient_list=['maintenance@example.com']
        )