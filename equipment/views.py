from rest_framework import viewsets, permissions
from .models import Equipment
from .serializers import EquipmentSerializer

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().order_by('-created_at')
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Optionnel : filtrer par statut ou criticité
    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        criticality = self.request.query_params.get('criticality')
        if status:
            queryset = queryset.filter(status=status)
        if criticality:
            queryset = queryset.filter(criticality=criticality)
        return queryset