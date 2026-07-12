from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from equipment.models import Equipment
from maintenance.models import Intervention

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_machines = Equipment.objects.count()
        machines_active = Equipment.objects.filter(status='active').count()
        machines_maintenance = Equipment.objects.filter(status='maintenance').count()
        machines_out = Equipment.objects.filter(status='out_of_service').count()

        total_interventions = Intervention.objects.count()
        interventions_completed = Intervention.objects.filter(status='completed').count()
        interventions_in_progress = Intervention.objects.filter(status='in_progress').count()

        total_cost = Intervention.objects.filter(status='completed').aggregate(Sum('cost'))['cost__sum'] or 0

        completed = Intervention.objects.filter(status='completed', downtime_minutes__gt=0)
        avg_mttr = completed.aggregate(Avg('downtime_minutes'))['downtime_minutes__avg'] or 0

        availability = (machines_active / total_machines * 100) if total_machines > 0 else 0

        # Évolution mensuelle (6 derniers mois) – version corrigée
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_interventions = (
            Intervention.objects
            .filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        # Formater les dates pour le frontend (YYYY-MM)
        monthly_data = [
            {'month': item['month'].strftime('%Y-%m'), 'count': item['count']}
            for item in monthly_interventions
        ]

        return Response({
            'total_machines': total_machines,
            'machines_active': machines_active,
            'machines_maintenance': machines_maintenance,
            'machines_out': machines_out,
            'total_interventions': total_interventions,
            'interventions_completed': interventions_completed,
            'interventions_in_progress': interventions_in_progress,
            'total_cost': total_cost,
            'avg_mttr': round(avg_mttr, 2),
            'availability': round(availability, 2),
            'monthly_interventions': monthly_data,
        })