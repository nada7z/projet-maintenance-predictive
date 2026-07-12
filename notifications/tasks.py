from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_alert_email(subject, message, recipient_list):
    """Envoie un email d'alerte."""
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        fail_silently=False,
    )