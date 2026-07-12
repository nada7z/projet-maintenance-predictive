from rest_framework.routers import DefaultRouter
from .views import InterventionViewSet, PreventiveScheduleViewSet

router = DefaultRouter()
router.register(r'interventions', InterventionViewSet, basename='intervention')
router.register(r'preventive-schedules', PreventiveScheduleViewSet, basename='preventive')

urlpatterns = router.urls