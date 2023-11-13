import random
import string

from django.contrib.auth import authenticate
from django.http import Http404
from django.shortcuts import render, get_object_or_404
from drf_yasg.utils import swagger_auto_schema

# Create your views here.

from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from .models import User, Match, PlayerMatchRelation
from .serializers import UserSerializer, MatchSerializer, PlayerMatchRelationSerializer, LoginSerializer
from django.contrib.auth.hashers import make_password, check_password


class LoginView(APIView):
    """
    Login the user with the given username and password.
    """
    @swagger_auto_schema(request_body=LoginSerializer)
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Wrong Credentials'}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Logout the user with the given username and password.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MatchHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        match_relations = PlayerMatchRelation.objects.filter(user=request.user)
        serializer = PlayerMatchRelationSerializer(match_relations, many=True)
        return Response(serializer.data)


@api_view(['POST'])
def register_account(request):
    """
    Register a new account with the given email, username, and password.
    """
    # register account logic
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']

            # Create a new user
            user = User.objects.create_user(username=username, email=email, password=password)

            # Log the user in
            login(request, user)

            return redirect('home')  # Redirect to the home page after registration
    else:
        form = RegistrationForm()

    return render(request, 'react_login.js', {'form': form})
    # pass


@api_view(['PUT'])
def edit_account(request):
    """
    Edit the account with the given email, username, and password. Set parameter to null if you don't want to change it.
    """
    # edit account logic
    user = request.user
    # If using a profile model:
    # profile = UserProfile.objects.get(user=user)

    if request.method == 'POST':
        form = EditProfileForm(request.POST, instance=user)
        # If using a profile model:
        # form = EditProfileForm(request.POST, instance=profile)

        if form.is_valid():
            form.save()
            return redirect('view_profile')
    else:
        form = EditProfileForm(instance=user)
        # If using a profile model:
        # form = EditProfileForm(instance=profile)

    return render(request, 'react_edit_account.js', {'form': form})
    # pass


@api_view(['GET'])
def get_account_info(request):
    """
    Get the account info of the user with the given username.
    """
    # get account logic
    user = request.user
    # If using a profile model:
    # profile = UserProfile.objects.get(user=user)
    return render(request, 'react_user_profile.js', {'user': user})
    pass


@api_view(['POST'])
def create_game_room(request):
    """
    Create a new game room ID and return it.
    """
    # create match logic
    game_room_id = ''.join(random.choices(string.ascii_uppercase, k=6))
    return Response({'game_room_id': game_room_id}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def match_stats(request):
    """
    Get the match stats of the match with the given matchID.
    """
    # get match stats logic
    pass


@api_view(['POST'])
def save_match_stats(request):
    """
    Add a match stats entry to the database.
    """
    # save match stats logic
    pass

