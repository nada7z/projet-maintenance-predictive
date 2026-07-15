from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, GenerateReportView

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    path('reports/generate/', GenerateReportView.as_view(), name='generate-report'),
] + router.urls