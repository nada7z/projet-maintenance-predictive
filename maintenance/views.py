from rest_framework import viewsets, permissions
from .models import Intervention, PreventiveSchedule
from .serializers import InterventionSerializer, PreventiveScheduleSerializer

class InterventionViewSet(viewsets.ModelViewSet):
    queryset = Intervention.objects.all().order_by('-planned_start')
    serializer_class = InterventionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtrer par technicien si ce n'est pas un admin/supervisor
        user = self.request.user
        if user.role in ['admin', 'supervisor']:
            return super().get_queryset()
        return super().get_queryset().filter(assigned_to=user)

class PreventiveScheduleViewSet(viewsets.ModelViewSet):
    queryset = PreventiveSchedule.objects.all()
    serializer_class = PreventiveScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]