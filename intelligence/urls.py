from django.urls import path
from .views import SensorDataViewSet, RiskScoreView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'sensor-data', SensorDataViewSet, basename='sensordata')

urlpatterns = router.urls
urlpatterns += [
    path('risk/<int:machine_id>/', RiskScoreView.as_view(), name='risk-score'),
]