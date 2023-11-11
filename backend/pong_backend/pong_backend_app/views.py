import random
import string

from django.http import Http404
from django.shortcuts import render, get_object_or_404

# Create your views here.

from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, Match, PlayerMatchRelation
from .serializers import UserSerializer, MatchSerializer, PlayerMatchRelationSerializer
from django.contrib.auth.hashers import make_password, check_password


@api_view(['POST'])
def login(request):
    """
    Login with the given username and password.
    """
    # login logic
    pass


@api_view(['POST'])
def register_account(request):
    """
    Register a new account with the given email, username, and password.
    """
    # register account logic

    username = request.POST.get('username')
    password = request.POST.get('password')
    email = request.POST.get('email')

    try:
        user = User.objects.create(Username = username, Email = email)
        user.make_password(password)
        user.save()
    except Exception as e:
        print(e)

    pass


@api_view(['PUT'])
def edit_account(request):
    """
    Edit the account with the given email, username, and password. Set parameter to null if you don't want to change it.
    """
    # edit account logic
    pass


@api_view(['GET'])
def get_account_info(request):
    """
    Get the account info of the user with the given username.
    """
    # get account logic
    pass


class Http204:
    pass


@api_view(['GET'])
def user_match_history(request, user_id):
    """
    Get the match history of the user with the given userID.
    """
    # get match history logic
    try:
        user = User.objects.get(userID=user_id)
        match_history = user.matches.all()
        serializer = MatchSerializer(match_history, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

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

