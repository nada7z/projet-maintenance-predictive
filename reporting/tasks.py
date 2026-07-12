from celery import shared_task
from django.conf import settings
from django.core.files import File
from django.utils import timezone
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from openpyxl import Workbook
import os
from .models import Report
from equipment.models import Equipment
from maintenance.models import Intervention
from notifications.tasks import send_alert_email

@shared_task
def generate_report_task(user_id, report_type, format_type, filters):
    """Génère un rapport (PDF ou Excel) en arrière-plan."""
    # Générer le contenu du rapport
    if format_type == 'pdf':
        file_content = generate_pdf_report(report_type, filters)
        extension = 'pdf'
        content_type = 'application/pdf'
    else:  # excel
        file_content = generate_excel_report(report_type, filters)
        extension = 'xlsx'
        content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    # Sauvegarder dans le modèle Report
    from django.contrib.auth import get_user_model
    User = get_user_model()
    user = User.objects.get(id=user_id)

    file_name = f"report_{report_type}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{extension}"
    file_path = os.path.join('reports', file_name)

    report = Report.objects.create(
        title=f"Rapport {report_type} - {timezone.now().date()}",
        type=report_type,
        format=format_type,
        generated_by=user,
        parameters=filters,
    )

    # Sauvegarder le fichier
    report.file.save(file_name, File(BytesIO(file_content)), save=True)

    # Notifier l'utilisateur (email)
    send_alert_email.delay(
        subject=f"Rapport {report_type} généré",
        message=f"Votre rapport {report_type} est disponible dans l'application.",
        recipient_list=[user.email]
    )

    return report.id

def generate_pdf_report(report_type, filters):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    p.drawString(100, 800, f"Rapport {report_type}")
    # ... (contenu réel à remplir)
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer.getvalue()

def generate_excel_report(report_type, filters):
    wb = Workbook()
    ws = wb.active
    ws.title = "Rapport"
    ws.append(["Nom", "Modèle", "Statut", "Criticité"])
    for machine in Equipment.objects.all():
        ws.append([machine.name, machine.model, machine.status, machine.criticality])
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()