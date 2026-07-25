from rest_framework import viewsets, permissions
from .models import Intervention, InterventionComment, PreventiveSchedule
from .serializers import CommentSerializer, InterventionSerializer, PreventiveScheduleSerializer

class InterventionViewSet(viewsets.ModelViewSet):
    queryset = Intervention.objects.all().order_by('-planned_start')
    serializer_class = InterventionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Filtrer par rôle (technicien ne voit que ses interventions)
        if user.role not in ['admin', 'supervisor']:
            queryset = queryset.filter(assigned_to=user)

        # ✅ Filtrer par statut (si fourni)
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        return queryset

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