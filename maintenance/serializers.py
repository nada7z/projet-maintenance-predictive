from rest_framework import serializers
from .models import Intervention, InterventionComment, PreventiveSchedule

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

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()

    class Meta:
        model = InterventionComment
        fields = [
            'id', 'intervention', 'author', 'author_name', 'author_role',
            'content', 'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'intervention', 'created_at', 'updated_at']  # ← intervention ajouté

    def get_author_name(self, obj):
        if obj.author.first_name and obj.author.last_name:
            return f"{obj.author.first_name} {obj.author.last_name}"
        return obj.author.username

    def get_author_role(self, obj):
        return obj.author.role