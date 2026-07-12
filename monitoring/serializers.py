from rest_framework import serializers

class DashboardStatsSerializer(serializers.Serializer):
    total_machines = serializers.IntegerField()
    machines_active = serializers.IntegerField()
    machines_maintenance = serializers.IntegerField()
    machines_out = serializers.IntegerField()
    total_interventions = serializers.IntegerField()
    interventions_completed = serializers.IntegerField()
    interventions_in_progress = serializers.IntegerField()
    total_cost = serializers.FloatField()
    avg_mttr = serializers.FloatField()  # Mean Time To Repair
    availability = serializers.FloatField()  # en pourcentage