from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Alert
from .serializers import AlertSerializer

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all().order_by('-created_at')
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Les techniciens ne voient que leurs propres alertes (liées à leurs machines)
        user = self.request.user
        if user.role == 'tech':
            # On suppose qu'un tech est assigné à des interventions sur certaines machines
            # Ici on simplifie : on lui montre toutes les alertes (à adapter)
            return super().get_queryset()
        return super().get_queryset()

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        alert = self.get_object()
        alert.is_read = True
        alert.save()
        return Response({'status': 'alert marked as read'})