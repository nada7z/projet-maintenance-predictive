from rest_framework import serializers
from .models import Equipment
from rest_framework import serializers
from maintenance.models import Intervention
from notifications.models import Alert

class EquipmentSerializer(serializers.ModelSerializer):
    # Champ calculé pour l'URL complète du QR code
    qr_code_url = serializers.SerializerMethodField()

    # Relations inverses (liste des interventions et alertes)
    interventions = serializers.SerializerMethodField()
    alerts = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = '__all__'
        read_only_fields = ('qr_code', 'created_at', 'updated_at')

    def get_qr_code_url(self, obj):
        if obj.qr_code:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_code.url)
            return obj.qr_code.url
        return None

    def get_interventions(self, obj):
        # Récupérer les interventions liées à cette machine, triées par date
        interventions = obj.interventions.all().order_by('-planned_start')
        return [
            {
                'id': inv.id,
                'type': inv.type,
                'priority': inv.priority,
                'status': inv.status,
                'planned_start': inv.planned_start,
                'description': inv.description,
                'assigned_to_name': inv.assigned_to.username if inv.assigned_to else None,
                'machine_name': obj.name
            }
            for inv in interventions
        ]

    def get_alerts(self, obj):
        alerts = obj.alerts.all().order_by('-created_at')
        return [
            {
                'id': alert.id,
                'type': alert.type,
                'severity': alert.severity,
                'message': alert.message,
                'created_at': alert.created_at,
                'is_read': alert.is_read
            }
            for alert in alerts
        ]

class InterventionBriefSerializer(serializers.ModelSerializer):
    machine_name = serializers.CharField(source='machine.name', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Intervention
        fields = ('id', 'type', 'priority', 'status', 'planned_start', 'planned_end', 
                  'description', 'assigned_to_name', 'machine_name')

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip() or obj.assigned_to.username
        return None

class AlertBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ('id', 'type', 'severity', 'message', 'is_read', 'created_at')

class EquipmentDetailSerializer(serializers.ModelSerializer):
    interventions = InterventionBriefSerializer(many=True, read_only=True)
    alerts = AlertBriefSerializer(many=True, read_only=True)
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = '__all__'
        read_only_fields = ('qr_code', 'created_at', 'updated_at')

    def get_qr_code_url(self, obj):
        if obj.qr_code and hasattr(obj.qr_code, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_code.url)
            return obj.qr_code.url
        return None