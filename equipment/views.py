from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Equipment
from .serializers import EquipmentSerializer
from maintenance.models import Intervention
from maintenance.serializers import InterventionSerializer
from notifications.models import Alert
from notifications.serializers import AlertSerializer
from rest_framework.generics import RetrieveAPIView
from .serializers import EquipmentDetailSerializer

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().order_by('-created_at')
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        criticality = self.request.query_params.get('criticality')
        location = self.request.query_params.get('location')
        if status:
            queryset = queryset.filter(status=status)
        if criticality:
            queryset = queryset.filter(criticality=criticality)
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset

    @action(detail=True, methods=['get'])
    def interventions(self, request, pk=None):
        """Récupère toutes les interventions pour un équipement"""
        equipment = self.get_object()
        interventions = Intervention.objects.filter(machine=equipment).order_by('-planned_start')
        serializer = InterventionSerializer(interventions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def alerts(self, request, pk=None):
        """Récupère toutes les alertes pour un équipement"""
        equipment = self.get_object()
        alerts = Alert.objects.filter(machine=equipment).order_by('-created_at')
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)
    
class EquipmentDetailView(RetrieveAPIView):
    queryset = Equipment.objects.prefetch_related('interventions', 'alerts')
    serializer_class = EquipmentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]