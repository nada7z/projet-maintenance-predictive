from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    # Remplace l'ID par la représentation textuelle (__str__) de la machine
    machine = serializers.StringRelatedField()

    class Meta:
        model = Alert
        fields = '__all__'
        read_only_fields = ('created_at',)