import random
import string

from django.contrib.auth import authenticate, update_session_auth_hash
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

from .models import PlayerMatchRelation, Match
from .serializers import (UserSerializer, PlayerMatchRelationSerializer, LoginSerializer,
                          EditProfileSerializer, ChangePasswordSerializer, UserInfoSerializer,
                          LeaderboardEntrySerializer, MatchDetailSerializer, MatchSubmissionSerializer)
from django.contrib.auth.hashers import make_password, check_password


class LoginView(APIView):
    """
    Login the user with the given username and password.
    """
    @swagger_auto_schema(request_body=LoginSerializer, security=[{'Token': []}], tags=['no_auth', 'user'])
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'username': user.username}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Wrong Credentials'}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Logout the user with the given username and password.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(security=[{'Token': []}], tags=['user', 'needs_auth'])
    def post(self, request, *args, **kwargs):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MatchHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(security=[{'Token': []}], tags=['match', 'needs_auth'])
    def get(self, request):
        match_relations = PlayerMatchRelation.objects.filter(user=request.user)
        serializer = PlayerMatchRelationSerializer(match_relations, many=True)
        return Response(serializer.data)


class RegisterView(APIView):
    """
    Register a new user with the given username, email, and password.
    """
    @swagger_auto_schema(request_body=UserSerializer, tags=['account', 'no_auth'])
    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'username': user.username}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditProfileView(APIView):
    """
    Edit the profile of the user.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(request_body=EditProfileSerializer, security=[{'Token': []}], tags=['account', 'needs_auth'])
    def post(self, request, *args, **kwargs):
        user = request.user
        serializer = EditProfileSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile successfully updated'}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    Change the password of the user.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(request_body=ChangePasswordSerializer, security=[{'Token': []}], tags=['account', 'needs_auth'])
    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Wrong password'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            update_session_auth_hash(request, user)
            return Response({'message': 'Password successfully updated'}, status=status.HTTP_200_OK)


class UserInfoView(APIView):
    """
    Get the username and email of the user.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(security=[{'Token': []}], tags=['account', 'needs_auth'])
    def get(self, request):
        user = request.user
        serializer = UserInfoSerializer(user)
        return Response(serializer.data)


class MatchDetailView(APIView):
    """
    Get the details of a match.
    """

    @swagger_auto_schema(tags=['match', 'no_auth'])
    def get(self, request, matchID):
        try:
            match = Match.objects.get(matchID=matchID)
            serializer = MatchDetailSerializer(match)
            return Response(serializer.data)
        except Match.DoesNotExist:
            return Response({'error': 'Match does not exist'}, status=status.HTTP_404_NOT_FOUND)


class CreateGameRoomView(APIView):
    """
    Create a new game room ID and return it.
    could totally do this on the frontend lol
    """
    @swagger_auto_schema(tags=['match', 'no_auth'])
    def get(self, request, *args, **kwargs):
        game_room_id = ''.join(random.choices(string.ascii_uppercase, k=6))
        return Response({'game_room_id': game_room_id}, status=status.HTTP_201_CREATED)


class SaveMatchStatsView(APIView):
    """
    Save the stats of a match
    """
    @swagger_auto_schema(request_body=MatchSubmissionSerializer, tags=['match', 'game-server', 'no_auth'])
    def post(self, request):
        serializer = MatchSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            match = serializer.save()
            return Response({"matchID": match.matchID}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

