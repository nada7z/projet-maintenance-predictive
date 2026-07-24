from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    InterventionViewSet, PreventiveScheduleViewSet, CommentViewSet
)

router = DefaultRouter()
router.register(r'interventions', InterventionViewSet, basename='intervention')
router.register(r'preventive-schedules', PreventiveScheduleViewSet, basename='preventive')

urlpatterns = [
    path('', include(router.urls)),
    # Routes pour les commentaires (rattachés à une intervention)
    path(
        'interventions/<int:intervention_pk>/comments/',
        CommentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='intervention-comments'
    ),
    path(
        'interventions/<int:intervention_pk>/comments/<int:pk>/',
        CommentViewSet.as_view({'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='intervention-comment-detail'
    ),
]