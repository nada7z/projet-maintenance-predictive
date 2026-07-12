from rest_framework.routers import DefaultRouter, path
from .views import ReportViewSet, GenerateReportView

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = router.urls
urlpatterns += [
    path('generate/', GenerateReportView.as_view(), name='generate-report'),
]