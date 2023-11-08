from django.shortcuts import render

# Create your views here.

from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, Match, PlayerMatchRelation
from .serializers import UserSerializer, MatchSerializer, PlayerMatchRelationSerializer
from django.contrib.auth.hashers import make_password, check_password


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        request.data['password'] = make_password(request.data['password'])
        return super().create(request, *args, **kwargs)


@api_view(['POST'])
def register_account(request):
    # register account logic
    pass


@api_view(['PUT'])
def edit_account(request):
    # edit account logic
    pass


@api_view(['GET'])
def get_account_info(request):
    # get account logic
    pass


@api_view(['GET'])
def user_match_history(request):
    # get match history logic
    pass


@api_view(['POST'])
def create_game_room(request):
    # create match logic
    pass


@api_view(['GET'])
def match_stats(request):
    # get match stats logic
    pass


@api_view(['POST'])
def save_match_stats(request):
    # save match stats logic
    pass
