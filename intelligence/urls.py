from django.urls import path
from .views import CriticalMachinesView, RiskHistoryView, SensorDataByMachineView, SensorDataViewSet, RiskScoreView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'sensor-data', SensorDataViewSet, basename='sensordata')

urlpatterns = router.urls
urlpatterns += [
    path('risk/<int:machine_id>/', RiskScoreView.as_view(), name='risk-score'),
    path('sensor-data/<int:machine_id>/', SensorDataByMachineView.as_view(), name='sensor-data-by-machine'),
    path('risk/critical/', CriticalMachinesView.as_view(), name='critical-machines'),
    path('risk/history/<int:machine_id>/', RiskHistoryView.as_view(), name='risk-history'),
]