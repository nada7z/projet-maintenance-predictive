from rest_framework import serializers
from .models import SensorData

class SensorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorData
        fields = '__all__'
        read_only_fields = ('failure',)

class RiskScoreSerializer(serializers.Serializer):
    machine_id = serializers.IntegerField()
    risk_score = serializers.FloatField()  # en pourcentage
    last_updated = serializers.DateTimeField()