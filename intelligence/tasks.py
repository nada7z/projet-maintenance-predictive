from celery import shared_task
from django.utils import timezone
from .models import SensorData
from equipment.models import Equipment
from notifications.tasks import send_alert_email
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
from django.conf import settings

@shared_task
def train_ai_model():
    """Entraîne le modèle Random Forest sur toutes les données disponibles."""
    print("Début de l'entraînement du modèle...")
    data = SensorData.objects.all().values(
        'temperature', 'vibration', 'operating_hours', 'consumption', 'failure'
    )
    if len(data) < 100:
        print("Pas assez de données pour entraîner le modèle.")
        return

    df = pd.DataFrame(data)
    X = df[['temperature', 'vibration', 'operating_hours', 'consumption']]
    y = df['failure']

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Sauvegarder le modèle
    model_dir = os.path.join(settings.BASE_DIR, 'intelligence', 'models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'random_forest.pkl')
    joblib.dump(model, model_path)
    print(f"Modèle sauvegardé à {model_path}")

@shared_task
def update_risk_scores_for_machine(machine_id):
    """Met à jour le score de risque pour une machine donnée (génère une alerte si > 70%)."""
    from notifications.models import Alert
    try:
        machine = Equipment.objects.get(id=machine_id)
    except Equipment.DoesNotExist:
        return

    # Simuler un calcul rapide (ou appeler le modèle)
    # Ici, on va chercher le score via la même logique que dans la vue,
    # mais on pourrait l'optimiser.
    # Pour éviter la duplication, on va juste créer une alerte si la température moyenne > 75
    # (simulation pour l'exemple)
    latest = SensorData.objects.filter(machine=machine).order_by('-timestamp')[:24]
    if len(latest) < 24:
        return
    avg_temp = np.mean([d.temperature for d in latest])
    if avg_temp > 75:
        Alert.objects.create(
            machine=machine,
            type='predictive',
            severity='critical',
            message=f"Risque élevé de panne détecté (température moyenne {avg_temp:.1f}°C)"
        )
        # Envoyer un email si critique
        send_alert_email.delay(
            subject="Alerte critique - Risque de panne",
            message=f"La machine {machine.name} présente un risque de panne élevé.",
            recipient_list=['admin@example.com']
        )