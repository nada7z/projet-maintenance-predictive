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
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm
from datetime import datetime

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
    """
    Génère un rapport PDF complet avec :
    - En-tête avec titre, date, type de rapport
    - Tableau des équipements (nom, modèle, statut, criticité)
    - Statistiques récapitulatives
    - Liste des interventions (si demandé)
    """
    buffer = BytesIO()
    
    # Créer le document PDF
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
    )
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e3a8a'),
        spaceAfter=30,
        alignment=1,  # Centré
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=12,
    )
    normal_style = styles['Normal']
    
    # Éléments du document
    elements = []
    
    # --- 1. EN-TÊTE ---
    # Titre
    title = f"Rapport {dict(Report.TYPE_CHOICES).get(report_type, report_type).upper()}"
    elements.append(Paragraph(title, title_style))
    
    # Date et heure
    now = timezone.now().strftime('%d/%m/%Y à %H:%M')
    elements.append(Paragraph(f"Généré le {now}", normal_style))
    elements.append(Spacer(1, 0.5*cm))
    
    # Filtres appliqués
    if filters:
        filter_text = "Filtres appliqués : "
        if filters.get('date_from'):
            filter_text += f"Du {filters['date_from']} "
        if filters.get('date_to'):
            filter_text += f"au {filters['date_to']} "
        if filters.get('machine'):
            filter_text += f"| Machine ID: {filters['machine']}"
        elements.append(Paragraph(filter_text, normal_style))
    
    elements.append(Spacer(1, 0.5*cm))
    
    # --- 2. STATISTIQUES RAPIDES ---
    total_machines = Equipment.objects.count()
    active_machines = Equipment.objects.filter(status='active').count()
    maintenance_machines = Equipment.objects.filter(status='maintenance').count()
    out_machines = Equipment.objects.filter(status='out_of_service').count()
    
    stats_data = [
        ['Total machines', str(total_machines)],
        ['Actives', str(active_machines)],
        ['En maintenance', str(maintenance_machines)],
        ['Hors service', str(out_machines)],
    ]
    stats_table = Table(stats_data, colWidths=[6*cm, 3*cm])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
    ]))
    elements.append(Paragraph("📊 Résumé du parc", heading_style))
    elements.append(stats_table)
    elements.append(Spacer(1, 0.5*cm))
    
    # --- 3. TABLEAU DES ÉQUIPEMENTS ---
    # Filtrer les équipements si demandé
    equipments = Equipment.objects.all()
    if filters and filters.get('machine'):
        equipments = equipments.filter(id=filters['machine'])
    
    # En-tête du tableau
    table_data = [
        ['Nom', 'Modèle', 'Statut', 'Criticité', 'Localisation']
    ]
    
    # Lignes du tableau
    for eq in equipments:
        status_map = {
            'active': 'Actif',
            'maintenance': 'En maintenance',
            'out_of_service': 'Hors service'
        }
        criticality_map = {
            'low': 'Basse',
            'medium': 'Moyenne',
            'high': 'Élevée'
        }
        table_data.append([
            eq.name,
            eq.model,
            status_map.get(eq.status, eq.status),
            criticality_map.get(eq.criticality, eq.criticality),
            eq.location or '—'
        ])
    
    # Créer le tableau
    col_widths = [4*cm, 4*cm, 3.5*cm, 3*cm, 4*cm]
    eq_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    eq_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.HexColor('#ffffff')]),
    ]))
    
    elements.append(Paragraph("📋 Liste des équipements", heading_style))
    elements.append(eq_table)
    
    # --- 4. INTERVENTIONS RÉCENTES (optionnel) ---
    # Ajouter une section avec les interventions des 30 derniers jours
    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
    recent_interventions = Intervention.objects.filter(
        created_at__gte=thirty_days_ago
    )[:10]
    
    if recent_interventions:
        elements.append(Spacer(1, 0.5*cm))
        elements.append(Paragraph("🔧 Interventions récentes (30 jours)", heading_style))
        
        inter_data = [
            ['Machine', 'Type', 'Statut', 'Date']
        ]
        for inv in recent_interventions:
            inter_data.append([
                inv.machine.name if inv.machine else 'N/A',
                inv.type,
                inv.status,
                inv.created_at.strftime('%d/%m/%Y')
            ])
        
        inter_table = Table(inter_data, colWidths=[4*cm, 3*cm, 3.5*cm, 3.5*cm])
        inter_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.HexColor('#ffffff')]),
        ]))
        elements.append(inter_table)
    
    # --- 5. PIED DE PAGE ---
    elements.append(Spacer(1, 1*cm))
    elements.append(Paragraph(
        f"Document généré par OCP Maintenance - {datetime.now().strftime('%Y')}",
        ParagraphStyle('Footer', parent=normal_style, fontSize=8, textColor=colors.HexColor('#94a3b8'), alignment=1)
    ))
    
    # Construire le PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

def generate_excel_report(report_type, filters):
    wb = Workbook()
    
    # Feuille "Équipements"
    ws = wb.active
    ws.title = "Équipements"
    ws.append(["Nom", "Modèle", "Statut", "Criticité", "Localisation"])
    for machine in Equipment.objects.all():
        ws.append([
            machine.name,
            machine.model,
            machine.status,
            machine.criticality,
            machine.location or ''
        ])
    
    # Feuille "Statistiques"
    ws_stats = wb.create_sheet("Statistiques")
    ws_stats.append(["Métrique", "Valeur"])
    ws_stats.append(["Total machines", Equipment.objects.count()])
    ws_stats.append(["Actives", Equipment.objects.filter(status='active').count()])
    ws_stats.append(["En maintenance", Equipment.objects.filter(status='maintenance').count()])
    ws_stats.append(["Hors service", Equipment.objects.filter(status='out_of_service').count()])
    
    # Feuille "Interventions" (optionnel)
    ws_inter = wb.create_sheet("Interventions")
    ws_inter.append(["Machine", "Type", "Statut", "Date"])
    from maintenance.models import Intervention
    for inv in Intervention.objects.all().order_by('-created_at')[:50]:
        ws_inter.append([
            inv.machine.name if inv.machine else '',
            inv.type,
            inv.status,
            inv.created_at.strftime('%d/%m/%Y')
        ])
    
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()