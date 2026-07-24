from rest_framework import viewsets, permissions
from .models import Intervention, InterventionComment, PreventiveSchedule
from .serializers import CommentSerializer, InterventionSerializer, PreventiveScheduleSerializer

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

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        intervention_id = self.kwargs.get('intervention_pk')
        return InterventionComment.objects.filter(intervention_id=intervention_id)

    def perform_create(self, serializer):
        intervention_id = self.kwargs.get('intervention_pk')
        intervention = Intervention.objects.get(id=intervention_id)
        serializer.save(author=self.request.user, intervention=intervention)