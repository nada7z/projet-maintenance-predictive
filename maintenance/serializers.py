from rest_framework import serializers
from .models import Intervention, PreventiveSchedule

class InterventionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Intervention
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class PreventiveScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreventiveSchedule
        fields = '__all__'
        read_only_fields = ('last_execution',)