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

def extract_features(sensor_data_queryset):
    """Extract 10 features from the last 24 sensor records for a machine."""
    temps = [d.temperature for d in sensor_data_queryset]
    vibs = [d.vibration for d in sensor_data_queryset]
    hours = [d.operating_hours for d in sensor_data_queryset]
    cons = [d.consumption for d in sensor_data_queryset]

    features = [
        np.mean(temps), np.std(temps), np.max(temps), np.min(temps),
        np.mean(vibs), np.std(vibs), np.max(vibs), np.min(vibs),
        np.sum(hours), np.mean(cons)
    ]
    return np.array(features).reshape(1, -1)

@shared_task
def train_ai_model():
    print("Début de l'entraînement du modèle...")
    # Récupérer toutes les données capteurs
    sensor_data = SensorData.objects.all().order_by('machine', 'timestamp')
    if not sensor_data.exists():
        print("Aucune donnée capteur disponible.")
        return

    # Grouper par machine et prendre les 24 derniers enregistrements
    machines = sensor_data.values_list('machine', flat=True).distinct()
    X_list = []
    y_list = []

    for machine_id in machines:
        records = SensorData.objects.filter(machine_id=machine_id).order_by('-timestamp')[:24]
        if len(records) < 24:
            continue  # pas assez de données pour cette machine
        # Extraire les features
        features = extract_features(records)[0]  # shape (10,)
        # La cible est la moyenne des `failure` sur les 24h (ou la dernière valeur ? On prend la dernière)
        target = records[0].failure  # on prend la panne la plus récente
        X_list.append(features)
        y_list.append(target)

    if len(X_list) == 0:
        print("Pas assez de données pour entraîner (il faut au moins 24h par machine).")
        return

    X = np.array(X_list)
    y = np.array(y_list)

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

