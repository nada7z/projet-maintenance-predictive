from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from .models import Report
from .serializers import ReportSerializer
from .tasks import generate_report_task

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all().order_by('-generated_at')
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # On ne crée pas directement un rapport via ce sérialiseur – on passe par l'endpoint de génération
        pass

class GenerateReportView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReportSerializer

    def post(self, request):
        # Récupérer les paramètres du rapport
        report_type = request.data.get('type', 'monthly')
        format_type = request.data.get('format', 'pdf')
        filters = request.data.get('filters', {})

        # Lancer la tâche asynchrone
        task = generate_report_task.delay(
            user_id=request.user.id,
            report_type=report_type,
            format_type=format_type,
            filters=filters
        )

        return Response({
            'task_id': task.id,
            'status': 'Report generation started',
            'message': 'Vous recevrez une notification lorsque le rapport sera prêt.'
        }, status=status.HTTP_202_ACCEPTED)