from rest_framework import viewsets, generics, permissions, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .tasks import extract_features
from rest_framework.response import Response
from django.utils import timezone
from .models import SensorData
from .serializers import SensorDataSerializer, RiskScoreSerializer
from .tasks import update_risk_scores_for_machine
from equipment.models import Equipment
import joblib
import os
import numpy as np
from django.conf import settings

class SensorDataViewSet(viewsets.ModelViewSet):
    queryset = SensorData.objects.all().order_by('-timestamp')
    serializer_class = SensorDataSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Enregistre la donnée et déclenche la mise à jour du risque en arrière-plan
        instance = serializer.save()
        update_risk_scores_for_machine.delay(instance.machine.id)
    
class RiskScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, machine_id):
        try:
            machine = Equipment.objects.get(id=machine_id)
        except Equipment.DoesNotExist:
            return Response({"error": "Machine non trouvée"}, status=status.HTTP_404_NOT_FOUND)

        # Récupérer les 24 dernières heures
        latest_data = SensorData.objects.filter(machine=machine).order_by('-timestamp')[:24]
        if len(latest_data) < 24:
            return Response({
                "machine_id": machine.id,
                "risk_score": None,
                "last_updated": None,
                "message": "Pas assez de données (minimum 24h requis)"
            })

        # Extraire les features
        features = extract_features(latest_data)  # shape (1, 10)

        # Charger le modèle
        model_path = os.path.join(settings.BASE_DIR, 'intelligence', 'models', 'random_forest.pkl')
        if not os.path.exists(model_path):
            return Response({
                "machine_id": machine.id,
                "risk_score": None,
                "last_updated": None,
                "message": "Le modèle n'est pas encore entraîné."
            })

        model = joblib.load(model_path)
        proba = model.predict_proba(features)[0][1]
        risk_score = round(proba * 100, 2)

        return Response({
            "machine_id": machine.id,
            "risk_score": risk_score,
            "last_updated": timezone.now().isoformat()
        })