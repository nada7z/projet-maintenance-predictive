from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, RegisterSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    """
    Liste tous les utilisateurs (accessible uniquement aux administrateurs
    ou superviseurs si vous voulez restreindre).
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        # Optionnel : ne renvoyer que les techniciens si vous voulez
        # return User.objects.filter(role='tech')
        # Ou pour l'instant, renvoyer tous les utilisateurs
        return User.objects.all()