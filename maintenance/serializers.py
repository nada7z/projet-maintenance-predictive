from rest_framework import serializers
from .models import Intervention, PreventiveSchedule

class InterventionSerializer(serializers.ModelSerializer):
    machine = serializers.StringRelatedField()   # Affiche le __str__ de la machine
    assigned_to = serializers.StringRelatedField()  # Affiche le __str__ de l'utilisateur

    class Meta:
        model = Intervention
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class PreventiveScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreventiveSchedule
        fields = '__all__'
        read_only_fields = ('last_execution',)