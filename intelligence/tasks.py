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
    from notifications.models import Alert
    from .tasks import extract_features
    import joblib
    import os
    from django.conf import settings
    import numpy as np

    try:
        machine = Equipment.objects.get(id=machine_id)
    except Equipment.DoesNotExist:
        return

    latest = SensorData.objects.filter(machine=machine).order_by('-timestamp')[:24]
    if len(latest) < 24:
        return

    # Load model and compute risk score
    model_path = os.path.join(settings.BASE_DIR, 'intelligence', 'models', 'random_forest.pkl')
    if not os.path.exists(model_path):
        return

    model = joblib.load(model_path)
    features = extract_features(latest)
    proba = model.predict_proba(features)[0][1]
    risk_score = round(proba * 100, 2)

    avg_temp = np.mean([d.temperature for d in latest])
    max_temp = np.max([d.temperature for d in latest])

    alert_created = False
    severity = 'warning'
    message = ""

    if max_temp > 90:
        severity = 'critical'
        message = f"⚠️ {machine.name} – TEMPÉRATURE CRITIQUE {max_temp}°C (IA: {risk_score}%)"
        alert_created = True
    elif risk_score > 70:
        severity = 'critical'
        message = f"🔴 {machine.name} – Risque de panne élevé : {risk_score}%"
        alert_created = True
    elif risk_score > 50:
        severity = 'warning'
        message = f"🟡 {machine.name} – Surveillance renforcée : risque à {risk_score}%"
        alert_created = True

    if alert_created:
        Alert.objects.create(
            machine=machine,
            type='predictive',
            severity=severity,
            message=message
        )
        send_alert_email.delay(
            subject=f"Alerte {severity} – {machine.name}",
            message=f"Machine : {machine.name}\nScore IA : {risk_score}%\n{message}",
            recipient_list=['maintenance@example.com']
        )